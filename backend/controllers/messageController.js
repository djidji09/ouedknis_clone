const { prisma } = require('../config/db');
const { asyncHandler } = require('../middleware/error');

// @desc    Get user's conversations
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const conversations = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId },
        { receiverId: userId }
      ]
    },
    orderBy: { createdAt: 'desc' },
    distinct: ['senderId', 'receiverId'],
    include: {
      sender: {
        select: {
          id: true,
          name: true
        }
      },
      receiver: {
        select: {
          id: true,
          name: true
        }
      },
      ad: {
        select: {
          id: true,
          title: true,
          price: true,
          images: {
            where: { isMain: true },
            select: {
              url: true
            },
            take: 1
          }
        }
      }
    }
  });

  // Group conversations by the other participant
  const groupedConversations = new Map();

  conversations.forEach(message => {
    const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
    const key = `${Math.min(userId, otherUserId)}-${Math.max(userId, otherUserId)}`;

    if (!groupedConversations.has(key)) {
      groupedConversations.set(key, {
        id: key,
        otherUser: message.senderId === userId ? message.receiver : message.sender,
        ad: message.ad,
        lastMessage: message,
        unreadCount: 0
      });
    }
  });

  // Get unread counts for each conversation
  for (const [key, conversation] of groupedConversations) {
    const unreadCount = await prisma.message.count({
      where: {
        senderId: conversation.otherUser.id,
        receiverId: userId,
        isRead: false
      }
    });
    conversation.unreadCount = unreadCount;
  }

  const conversationsArray = Array.from(groupedConversations.values());

  res.json({
    success: true,
    data: { conversations: conversationsArray }
  });
});

// @desc    Get messages between two users
// @route   GET /api/messages/:userId
// @access  Private
const getMessages = asyncHandler(async (req, res) => {
  const { userId: otherUserId } = req.params;
  const { page = 1, limit = 50 } = req.query;
  const currentUserId = req.user.id;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: currentUserId }
        ]
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: {
            id: true,
            name: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true
          }
        },
        ad: {
          select: {
            id: true,
            title: true,
            price: true,
            isActive: true,
            images: {
              where: { isMain: true },
              select: {
                url: true
              },
              take: 1
            }
          }
        }
      }
    }),
    prisma.message.count({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: currentUserId }
        ]
      }
    })
  ]);

  // Mark messages as read
  await prisma.message.updateMany({
    where: {
      senderId: otherUserId,
      receiverId: currentUserId,
      isRead: false
    },
    data: { isRead: true }
  });

  const totalPages = Math.ceil(total / take);

  res.json({
    success: true,
    data: {
      messages: messages.reverse(), // Reverse to show oldest first
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: take
      }
    }
  });
});

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
  const { content, receiverId, adId } = req.body;
  const senderId = req.user.id;

  // Check if receiver exists
  const receiver = await prisma.user.findUnique({
    where: { id: receiverId },
    select: { id: true, name: true, isActive: true }
  });

  if (!receiver || !receiver.isActive) {
    return res.status(404).json({
      success: false,
      message: 'Receiver not found or inactive'
    });
  }

  // Prevent sending message to oneself
  if (senderId === receiverId) {
    return res.status(400).json({
      success: false,
      message: 'Cannot send message to yourself'
    });
  }

  // Check if ad exists (if adId provided)
  let ad = null;
  if (adId) {
    ad = await prisma.ad.findUnique({
      where: { id: adId },
      select: { id: true, title: true, userId: true, isActive: true }
    });

    if (!ad || !ad.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Ad not found or inactive'
      });
    }
  }

  const message = await prisma.message.create({
    data: {
      content,
      senderId,
      receiverId,
      adId: adId || null
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true
        }
      },
      receiver: {
        select: {
          id: true,
          name: true
        }
      },
      ad: adId ? {
        select: {
          id: true,
          title: true,
          price: true,
          images: {
            where: { isMain: true },
            select: {
              url: true
            },
            take: 1
          }
        }
      } : false
    }
  });

  res.status(201).json({
    success: true,
    message: 'Message sent successfully',
    data: { message }
  });
});

// @desc    Mark messages as read
// @route   PUT /api/messages/:userId/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const { userId: senderId } = req.params;
  const receiverId = req.user.id;

  const updatedMessages = await prisma.message.updateMany({
    where: {
      senderId,
      receiverId,
      isRead: false
    },
    data: { isRead: true }
  });

  res.json({
    success: true,
    message: 'Messages marked as read',
    data: { updatedCount: updatedMessages.count }
  });
});

// @desc    Delete a message
// @route   DELETE /api/messages/:messageId
// @access  Private
const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const userId = req.user.id;

  const message = await prisma.message.findUnique({
    where: { id: messageId }
  });

  if (!message) {
    return res.status(404).json({
      success: false,
      message: 'Message not found'
    });
  }

  // Only sender can delete their message
  if (message.senderId !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this message'
    });
  }

  await prisma.message.delete({
    where: { id: messageId }
  });

  res.json({
    success: true,
    message: 'Message deleted successfully'
  });
});

// @desc    Get unread messages count
// @route   GET /api/messages/unread-count
// @access  Private
const getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const unreadCount = await prisma.message.count({
    where: {
      receiverId: userId,
      isRead: false
    }
  });

  res.json({
    success: true,
    data: { unreadCount }
  });
});

// @desc    Search messages
// @route   GET /api/messages/search
// @access  Private
const searchMessages = asyncHandler(async (req, res) => {
  const { query, userId: otherUserId } = req.query;
  const currentUserId = req.user.id;

  if (!query || query.length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Search query must be at least 2 characters long'
    });
  }

  const where = {
    content: {
      contains: query,
      mode: 'insensitive'
    },
    OR: [
      { senderId: currentUserId },
      { receiverId: currentUserId }
    ]
  };

  // Filter by specific conversation if otherUserId provided
  if (otherUserId) {
    where.OR = [
      { senderId: currentUserId, receiverId: otherUserId },
      { senderId: otherUserId, receiverId: currentUserId }
    ];
  }

  const messages = await prisma.message.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      sender: {
        select: {
          id: true,
          name: true
        }
      },
      receiver: {
        select: {
          id: true,
          name: true
        }
      },
      ad: {
        select: {
          id: true,
          title: true
        }
      }
    }
  });

  res.json({
    success: true,
    data: { messages }
  });
});

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  deleteMessage,
  getUnreadCount,
  searchMessages
};

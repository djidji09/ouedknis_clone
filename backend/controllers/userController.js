const { prisma } = require('../config/db');
const { asyncHandler } = require('../middleware/error');
const bcrypt = require('bcryptjs');

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, role, isActive } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const where = {
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }),
    ...(role && { role }),
    ...(isActive !== undefined && { isActive: isActive === 'true' })
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLogin: true,
        _count: {
          select: {
            ads: true,
            sentMessages: true,
            receivedMessages: true
          }
        }
      }
    }),
    prisma.user.count({ where })
  ]);

  const totalPages = Math.ceil(total / take);

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: take
      }
    }
  });
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Public
const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      phone: true,
      createdAt: true,
      _count: {
        select: {
          ads: {
            where: { isActive: true }
          }
        }
      }
    }
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    data: { user }
  });
});

// @desc    Get user's public profile with ads
// @route   GET /api/users/:id/profile
// @access  Public
const getUserProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 12 } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  // Get user info
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      phone: true,
      createdAt: true,
      _count: {
        select: {
          ads: {
            where: { isActive: true }
          }
        }
      }
    }
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Get user's active ads
  const [ads, totalAds] = await Promise.all([
    prisma.ad.findMany({
      where: {
        userId: id,
        isActive: true
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        images: {
          where: { isMain: true },
          select: {
            id: true,
            url: true
          },
          take: 1
        },
        _count: {
          select: {
            favorites: true,
            views: true
          }
        }
      }
    }),
    prisma.ad.count({
      where: {
        userId: id,
        isActive: true
      }
    })
  ]);

  const totalPages = Math.ceil(totalAds / take);

  res.json({
    success: true,
    data: {
      user,
      ads,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: totalAds,
        itemsPerPage: take
      }
    }
  });
});

// @desc    Update user (Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, role, isActive } = req.body;

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id }
  });

  if (!existingUser) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Check if email is already taken (if email is being updated)
  if (email && email !== existingUser.email) {
    const emailExists = await prisma.user.findUnique({
      where: { email }
    });

    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use'
      });
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      name: name || undefined,
      email: email || undefined,
      phone: phone || undefined,
      role: role || undefined,
      isActive: isActive !== undefined ? isActive : undefined
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true
    }
  });

  res.json({
    success: true,
    message: 'User updated successfully',
    data: { user: updatedUser }
  });
});

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          ads: true,
          sentMessages: true,
          receivedMessages: true
        }
      }
    }
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Prevent deleting user with active ads or messages
  if (user._count.ads > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete user with existing ads. Deactivate ads first.'
    });
  }

  if (user._count.sentMessages > 0 || user._count.receivedMessages > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete user with message history. Consider deactivating instead.'
    });
  }

  await prisma.user.delete({
    where: { id }
  });

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

// @desc    Toggle user active status (Admin only)
// @route   PUT /api/users/:id/toggle-status
// @access  Private/Admin
const toggleUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, isActive: true }
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { isActive: !user.isActive },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true
    }
  });

  res.json({
    success: true,
    message: `User ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully`,
    data: { user: updatedUser }
  });
});

// @desc    Get user statistics (Admin only)
// @route   GET /api/users/stats
// @access  Private/Admin
const getUserStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    activeUsers,
    adminUsers,
    usersToday,
    usersThisMonth
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.count({ where: { role: 'ADMIN' } }),
    prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    }),
    prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    })
  ]);

  // Get user registration trend (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const usersByDay = await prisma.user.groupBy({
    by: ['createdAt'],
    where: {
      createdAt: {
        gte: thirtyDaysAgo
      }
    },
    _count: {
      id: true
    }
  });

  res.json({
    success: true,
    data: {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      adminUsers,
      regularUsers: totalUsers - adminUsers,
      usersToday,
      usersThisMonth,
      registrationTrend: usersByDay
    }
  });
});

// @desc    Reset user password (Admin only)
// @route   PUT /api/users/:id/reset-password
// @access  Private/Admin
const resetUserPassword = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long'
    });
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true }
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Hash new password
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

  await prisma.user.update({
    where: { id },
    data: { password: hashedPassword }
  });

  res.json({
    success: true,
    message: 'Password reset successfully'
  });
});

module.exports = {
  getUsers,
  getUserById,
  getUserProfile,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getUserStats,
  resetUserPassword
};

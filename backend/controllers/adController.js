const { prisma } = require('../config/db');
const { asyncHandler } = require('../middleware/error');

// @desc    Get all ads with filters and pagination
// @route   GET /api/ads
// @access  Public
const getAds = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    search,
    categoryId,
    location,
    minPrice,
    maxPrice,
    condition,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  // Build where clause
  const where = {
    isActive: true,
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }),
    ...(categoryId && { categoryId }),
    ...(location && { location: { contains: location, mode: 'insensitive' } }),
    ...(minPrice && { price: { gte: parseFloat(minPrice) } }),
    ...(maxPrice && { price: { lte: parseFloat(maxPrice) } }),
    ...(condition && { condition })
  };

  // Build orderBy clause
  const orderBy = {};
  orderBy[sortBy] = sortOrder;

  const [ads, total] = await Promise.all([
    prisma.ad.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        },
        category: {
          select: {
            id: true,
            name: true
          }
        },
        images: {
          select: {
            id: true,
            url: true,
            isMain: true
          },
          orderBy: {
            isMain: 'desc'
          }
        },
        _count: {
          select: {
            favorites: true,
            views: true
          }
        }
      }
    }),
    prisma.ad.count({ where })
  ]);

  const totalPages = Math.ceil(total / take);

  res.json({
    success: true,
    data: {
      ads,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: take,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    }
  });
});

// @desc    Get single ad by ID
// @route   GET /api/ads/:id
// @access  Public
const getAdById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const ad = await prisma.ad.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          phone: true,
          createdAt: true,
          _count: {
            select: {
              ads: true
            }
          }
        }
      },
      category: {
        select: {
          id: true,
          name: true,
          parent: {
            select: {
              id: true,
              name: true
            }
          }
        }
      },
      images: {
        select: {
          id: true,
          url: true,
          isMain: true
        },
        orderBy: {
          isMain: 'desc'
        }
      },
      _count: {
        select: {
          favorites: true,
          views: true
        }
      }
    }
  });

  if (!ad) {
    return res.status(404).json({
      success: false,
      message: 'Ad not found'
    });
  }

  // Increment view count (only if user is not the owner)
  if (!req.user || req.user.id !== ad.userId) {
    await prisma.adView.create({
      data: {
        adId: ad.id,
        userId: req.user?.id || null,
        ipAddress: req.ip
      }
    });
  }

  res.json({
    success: true,
    data: { ad }
  });
});

// @desc    Create new ad
// @route   POST /api/ads
// @access  Private
const createAd = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    price,
    categoryId,
    location,
    condition,
    images = []
  } = req.body;

  // Verify category exists
  const category = await prisma.category.findUnique({
    where: { id: categoryId }
  });

  if (!category) {
    return res.status(400).json({
      success: false,
      message: 'Invalid category ID'
    });
  }

  // Create ad
  const ad = await prisma.ad.create({
    data: {
      title,
      description,
      price: parseFloat(price),
      categoryId,
      location,
      condition,
      userId: req.user.id,
      images: {
        create: images.map((image, index) => ({
          url: image.url,
          isMain: index === 0 || image.isMain === true
        }))
      }
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          phone: true
        }
      },
      category: {
        select: {
          id: true,
          name: true
        }
      },
      images: {
        select: {
          id: true,
          url: true,
          isMain: true
        }
      }
    }
  });

  res.status(201).json({
    success: true,
    message: 'Ad created successfully',
    data: { ad }
  });
});

// @desc    Update ad
// @route   PUT /api/ads/:id
// @access  Private
const updateAd = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    price,
    categoryId,
    location,
    condition,
    isActive
  } = req.body;

  // Check if ad exists and user owns it
  const existingAd = await prisma.ad.findUnique({
    where: { id },
    include: { user: true }
  });

  if (!existingAd) {
    return res.status(404).json({
      success: false,
      message: 'Ad not found'
    });
  }

  if (existingAd.userId !== req.user.id && req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this ad'
    });
  }

  // Update ad
  const updatedAd = await prisma.ad.update({
    where: { id },
    data: {
      title: title || undefined,
      description: description || undefined,
      price: price ? parseFloat(price) : undefined,
      categoryId: categoryId || undefined,
      location: location || undefined,
      condition: condition || undefined,
      isActive: isActive !== undefined ? isActive : undefined
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          phone: true
        }
      },
      category: {
        select: {
          id: true,
          name: true
        }
      },
      images: {
        select: {
          id: true,
          url: true,
          isMain: true
        }
      }
    }
  });

  res.json({
    success: true,
    message: 'Ad updated successfully',
    data: { ad: updatedAd }
  });
});

// @desc    Delete ad
// @route   DELETE /api/ads/:id
// @access  Private
const deleteAd = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if ad exists and user owns it
  const ad = await prisma.ad.findUnique({
    where: { id },
    include: { user: true }
  });

  if (!ad) {
    return res.status(404).json({
      success: false,
      message: 'Ad not found'
    });
  }

  if (ad.userId !== req.user.id && req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this ad'
    });
  }

  // Delete ad (cascade will handle related records)
  await prisma.ad.delete({
    where: { id }
  });

  res.json({
    success: true,
    message: 'Ad deleted successfully'
  });
});

// @desc    Get user's ads
// @route   GET /api/ads/my-ads
// @access  Private
const getMyAds = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const where = {
    userId: req.user.id,
    ...(status && { isActive: status === 'active' })
  };

  const [ads, total] = await Promise.all([
    prisma.ad.findMany({
      where,
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
          select: {
            id: true,
            url: true,
            isMain: true
          },
          where: { isMain: true },
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
    prisma.ad.count({ where })
  ]);

  const totalPages = Math.ceil(total / take);

  res.json({
    success: true,
    data: {
      ads,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: take
      }
    }
  });
});

// @desc    Toggle favorite ad
// @route   POST /api/ads/:id/favorite
// @access  Private
const toggleFavorite = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  // Check if ad exists
  const ad = await prisma.ad.findUnique({
    where: { id }
  });

  if (!ad) {
    return res.status(404).json({
      success: false,
      message: 'Ad not found'
    });
  }

  // Check if already favorited
  const existingFavorite = await prisma.favorite.findUnique({
    where: {
      userId_adId: {
        userId,
        adId: id
      }
    }
  });

  if (existingFavorite) {
    // Remove from favorites
    await prisma.favorite.delete({
      where: {
        userId_adId: {
          userId,
          adId: id
        }
      }
    });

    return res.json({
      success: true,
      message: 'Removed from favorites',
      data: { isFavorited: false }
    });
  } else {
    // Add to favorites
    await prisma.favorite.create({
      data: {
        userId,
        adId: id
      }
    });

    return res.json({
      success: true,
      message: 'Added to favorites',
      data: { isFavorited: true }
    });
  }
});

// @desc    Get user's favorite ads
// @route   GET /api/ads/favorites
// @access  Private
const getFavorites = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const [favorites, total] = await Promise.all([
    prisma.favorite.findMany({
      where: { userId: req.user.id },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        ad: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                phone: true
              }
            },
            category: {
              select: {
                id: true,
                name: true
              }
            },
            images: {
              select: {
                id: true,
                url: true,
                isMain: true
              },
              where: { isMain: true },
              take: 1
            },
            _count: {
              select: {
                favorites: true,
                views: true
              }
            }
          }
        }
      }
    }),
    prisma.favorite.count({ where: { userId: req.user.id } })
  ]);

  const totalPages = Math.ceil(total / take);

  res.json({
    success: true,
    data: {
      favorites: favorites.map(fav => fav.ad),
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: take
      }
    }
  });
});

module.exports = {
  getAds,
  getAdById,
  createAd,
  updateAd,
  deleteAd,
  getMyAds,
  toggleFavorite,
  getFavorites
};

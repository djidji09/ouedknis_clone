const { prisma } = require('../config/db');
const { asyncHandler } = require('../middleware/error');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const { includeSubcategories = 'true' } = req.query;

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    include: {
      ...(includeSubcategories === 'true' && {
        subcategories: {
          where: { isActive: true },
          orderBy: { name: 'asc' },
          include: {
            _count: {
              select: {
                ads: {
                  where: { isActive: true }
                }
              }
            }
          }
        }
      }),
      _count: {
        select: {
          ads: {
            where: { isActive: true }
          }
        }
      }
    }
  });

  // Get only parent categories (no parentId)
  const parentCategories = categories.filter(cat => !cat.parentId);

  res.json({
    success: true,
    data: { categories: parentCategories }
  });
});

// @desc    Get single category by ID
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      parent: {
        select: {
          id: true,
          name: true
        }
      },
      subcategories: {
        where: { isActive: true },
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: {
              ads: {
                where: { isActive: true }
              }
            }
          }
        }
      },
      _count: {
        select: {
          ads: {
            where: { isActive: true }
          }
        }
      }
    }
  });

  if (!category || !category.isActive) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  res.json({
    success: true,
    data: { category }
  });
});

// @desc    Create new category
// @route   POST /api/categories
// @access  Private (Admin only)
const createCategory = asyncHandler(async (req, res) => {
  const { name, description, parentId, icon } = req.body;

  // Check if parent category exists (if parentId provided)
  if (parentId) {
    const parentCategory = await prisma.category.findUnique({
      where: { id: parentId }
    });

    if (!parentCategory) {
      return res.status(400).json({
        success: false,
        message: 'Parent category not found'
      });
    }
  }

  // Check if category name already exists at the same level
  const existingCategory = await prisma.category.findFirst({
    where: {
      name: { equals: name, mode: 'insensitive' },
      parentId: parentId || null
    }
  });

  if (existingCategory) {
    return res.status(400).json({
      success: false,
      message: 'Category with this name already exists at this level'
    });
  }

  const category = await prisma.category.create({
    data: {
      name,
      description: description || null,
      parentId: parentId || null,
      icon: icon || null
    },
    include: {
      parent: parentId ? {
        select: {
          id: true,
          name: true
        }
      } : false,
      _count: {
        select: {
          ads: true,
          subcategories: true
        }
      }
    }
  });

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: { category }
  });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Admin only)
const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, parentId, icon, isActive } = req.body;

  // Check if category exists
  const existingCategory = await prisma.category.findUnique({
    where: { id }
  });

  if (!existingCategory) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  // Check if parent category exists (if parentId provided)
  if (parentId && parentId !== existingCategory.parentId) {
    const parentCategory = await prisma.category.findUnique({
      where: { id: parentId }
    });

    if (!parentCategory) {
      return res.status(400).json({
        success: false,
        message: 'Parent category not found'
      });
    }

    // Prevent circular reference
    if (parentId === id) {
      return res.status(400).json({
        success: false,
        message: 'Category cannot be its own parent'
      });
    }
  }

  // Check if name conflicts (if name is being changed)
  if (name && name !== existingCategory.name) {
    const nameConflict = await prisma.category.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        parentId: parentId || existingCategory.parentId || null,
        id: { not: id }
      }
    });

    if (nameConflict) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists at this level'
      });
    }
  }

  const updatedCategory = await prisma.category.update({
    where: { id },
    data: {
      name: name || undefined,
      description: description !== undefined ? description : undefined,
      parentId: parentId !== undefined ? parentId : undefined,
      icon: icon !== undefined ? icon : undefined,
      isActive: isActive !== undefined ? isActive : undefined
    },
    include: {
      parent: {
        select: {
          id: true,
          name: true
        }
      },
      subcategories: {
        where: { isActive: true },
        select: {
          id: true,
          name: true
        }
      },
      _count: {
        select: {
          ads: {
            where: { isActive: true }
          },
          subcategories: true
        }
      }
    }
  });

  res.json({
    success: true,
    message: 'Category updated successfully',
    data: { category: updatedCategory }
  });
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin only)
const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if category exists
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      subcategories: true,
      _count: {
        select: {
          ads: true
        }
      }
    }
  });

  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  // Check if category has subcategories
  if (category.subcategories.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete category with subcategories. Delete subcategories first.'
    });
  }

  // Check if category has ads
  if (category._count.ads > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete category with existing ads. Move or delete ads first.'
    });
  }

  await prisma.category.delete({
    where: { id }
  });

  res.json({
    success: true,
    message: 'Category deleted successfully'
  });
});

// @desc    Get category statistics
// @route   GET /api/categories/stats
// @access  Private (Admin only)
const getCategoryStats = asyncHandler(async (req, res) => {
  const stats = await prisma.category.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      parentId: true,
      _count: {
        select: {
          ads: {
            where: { isActive: true }
          },
          subcategories: {
            where: { isActive: true }
          }
        }
      }
    },
    orderBy: { name: 'asc' }
  });

  const totalCategories = stats.length;
  const totalAds = stats.reduce((sum, cat) => sum + cat._count.ads, 0);
  const parentCategories = stats.filter(cat => !cat.parentId);
  const subcategories = stats.filter(cat => cat.parentId);

  res.json({
    success: true,
    data: {
      totalCategories,
      totalAds,
      parentCategoriesCount: parentCategories.length,
      subcategoriesCount: subcategories.length,
      categories: stats
    }
  });
});

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats
};

import { Router } from 'express';
import { body, query, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { authenticate, checkAdminRole } from '../middleware/auth.js';
import { ensureUser, loadUser } from '../middleware/errorHandler.js';

const router = Router();
const prisma = new PrismaClient();

// Validation helper
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// GET /api/categories - List all categories
router.get('/', async (req, res, next) => {
  try {
    const { active } = req.query;

    const where = {};
    if (active !== undefined) {
      where.isActive = active === 'true';
    }

    const categories = await prisma.category.findMany({
      where,
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
      include: {
        _count: {
          select: { quizzes: true },
        },
      },
    });

    res.json({
      data: categories.map((cat) => ({
        ...cat,
        quizCount: cat._count.quizzes,
        _count: undefined,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/categories/:id - Get category by ID
router.get('/:id', async (req, res, next) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: req.params.id },
      include: {
        quizzes: {
          where: { isPublished: true },
          select: {
            id: true,
            title: true,
            difficulty: true,
            _count: { select: { questions: true } },
          },
        },
      },
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ data: category });
  } catch (err) {
    next(err);
  }
});

// POST /api/categories - Create category (admin only)
router.post(
  '/',
  authenticate,
  ensureUser,
  loadUser,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('description').optional().trim(),
    body('icon').optional().trim(),
    body('order').optional().isInt({ min: 0 }),
    body('isActive').optional().isBoolean(),
  ],
  validate,
  async (req, res, next) => {
    try {
      if (!checkAdminRole(req.user.role)) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { name, description, icon, order, isActive } = req.body;

      const category = await prisma.category.create({
        data: {
          name,
          description,
          icon,
          order: order ?? 0,
          isActive: isActive ?? true,
        },
      });

      res.status(201).json({ data: category });
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/categories/:id - Update category (admin only)
router.put(
  '/:id',
  authenticate,
  ensureUser,
  loadUser,
  [
    body('name').optional().trim().notEmpty(),
    body('description').optional().trim(),
    body('icon').optional().trim(),
    body('order').optional().isInt({ min: 0 }),
    body('isActive').optional().isBoolean(),
  ],
  validate,
  async (req, res, next) => {
    try {
      if (!checkAdminRole(req.user.role)) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { name, description, icon, order, isActive } = req.body;

      const category = await prisma.category.update({
        where: { id: req.params.id },
        data: {
          ...(name !== undefined && { name }),
          ...(description !== undefined && { description }),
          ...(icon !== undefined && { icon }),
          ...(order !== undefined && { order }),
          ...(isActive !== undefined && { isActive }),
        },
      });

      res.json({ data: category });
    } catch (err) {
      if (err.code === 'P2025') {
        return res.status(404).json({ error: 'Category not found' });
      }
      next(err);
    }
  }
);

// DELETE /api/categories/:id - Delete category (admin only)
router.delete('/:id', authenticate, ensureUser, loadUser, async (req, res, next) => {
  try {
    if (!checkAdminRole(req.user.role)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    await prisma.category.delete({
      where: { id: req.params.id },
    });

    res.status(204).send();
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Category not found' });
    }
    // Check for related quizzes
    if (err.code === 'P2003') {
      return res.status(400).json({
        error: 'Cannot delete category with existing quizzes',
      });
    }
    next(err);
  }
});

export default router;

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

// GET /api/quizzes - List quizzes with pagination and filtering
router.get('/', authenticate, ensureUser, loadUser, async (req, res, next) => {
  try {
    const {
      page = '1',
      limit = '10',
      categoryId,
      difficulty,
      published,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where = {};

    // Show all quizzes for admin, only published for regular users
    if (published !== undefined) {
      where.isPublished = published === 'true';
    } else if (!req.user || req.user.role !== 'ADMIN') {
      where.isPublished = true; // Default to published only for non-admins
    }
    // If admin and no published param specified, show all (no filter applied)

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (difficulty) {
      where.difficulty = difficulty.toUpperCase();
    }

    const [quizzes, total] = await Promise.all([
      prisma.quiz.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          category: {
            select: { id: true, name: true, icon: true },
          },
          _count: {
            select: { questions: true },
          },
        },
      }),
      prisma.quiz.count({ where }),
    ]);

    res.json({
      data: quizzes.map((quiz) => ({
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        difficulty: quiz.difficulty,
        timer: quiz.timer,
        isPublished: quiz.isPublished,
        createdAt: quiz.createdAt,
        category: quiz.category,
        questionCount: quiz._count.questions,
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/quizzes/:quizId/questions - Get questions for a quiz (admin)
router.get(
  '/:quizId/questions',
  authenticate,
  ensureUser,
  loadUser,
  async (req, res, next) => {
    try {
      if (!checkAdminRole(req.user.role)) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const questions = await prisma.question.findMany({
        where: { quizId: req.params.quizId },
        orderBy: { order: 'asc' },
        include: {
          answerOptions: {
            orderBy: { order: 'asc' },
          },
        },
      });

      res.json({ data: questions });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/quizzes/:quizId/questions - Create question for a quiz (admin)
router.post(
  '/:quizId/questions',
  authenticate,
  ensureUser,
  loadUser,
  [
    body('text').trim().notEmpty().withMessage('Question text is required'),
    body('order').optional().isInt({ min: 0 }),
    body('answerOptions')
      .isArray({ min: 2 })
      .withMessage('At least 2 answer options required'),
    body('answerOptions.*.text')
      .trim()
      .notEmpty()
      .withMessage('Answer option text is required'),
    body('answerOptions.*.isCorrect')
      .isBoolean()
      .withMessage('isCorrect must be a boolean'),
    body('answerOptions.*.order').optional().isInt({ min: 0 }),
  ],
  validate,
  async (req, res, next) => {
    try {
      if (!checkAdminRole(req.user.role)) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { text, order, answerOptions } = req.body;
      const quizId = req.params.quizId;

      const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
      if (!quiz) {
        return res.status(404).json({ error: 'Quiz not found' });
      }

      let questionOrder = order;
      if (questionOrder === undefined) {
        const maxOrder = await prisma.question.aggregate({
          where: { quizId },
          _max: { order: true },
        });
        questionOrder = (maxOrder._max.order ?? -1) + 1;
      }

      const question = await prisma.question.create({
        data: {
          quizId,
          text,
          order: questionOrder,
          answerOptions: {
            create: answerOptions.map((opt, idx) => ({
              text: opt.text,
              isCorrect: opt.isCorrect ?? false,
              order: opt.order ?? idx,
            })),
          },
        },
        include: {
          answerOptions: { orderBy: { order: 'asc' } },
        },
      });

      res.status(201).json({ data: question });
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/quizzes/:quizId/questions/reorder - Reorder questions
router.put(
  '/:quizId/questions/reorder',
  authenticate,
  ensureUser,
  loadUser,
  async (req, res, next) => {
    try {
      if (!checkAdminRole(req.user.role)) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { orderedIds } = req.body;

      await Promise.all(
        orderedIds.map((id, index) =>
          prisma.question.update({
            where: { id },
            data: { order: index },
          })
        )
      );

      res.json({ data: { success: true } });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/quizzes/:id - Get quiz with questions (for taking quiz)
router.get('/:id', async (req, res, next) => {
  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: req.params.id },
      include: {
        category: {
          select: { id: true, name: true, icon: true },
        },
        questions: {
          orderBy: { order: 'asc' },
          include: {
            answerOptions: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    if (!quiz.isPublished) {
      return res.status(403).json({ error: 'Quiz is not published' });
    }

    // Remove correct answer indicators from options
    const sanitizedQuestions = quiz.questions.map((q) => ({
      id: q.id,
      text: q.text,
      order: q.order,
      answerOptions: q.answerOptions.map((opt) => ({
        id: opt.id,
        text: opt.text,
        order: opt.order,
        // isCorrect intentionally omitted for client
      })),
    }));

    res.json({
      data: {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        difficulty: quiz.difficulty,
        timer: quiz.timer,
        category: quiz.category,
        questions: sanitizedQuestions,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/quizzes/:id/manage - Get full quiz data for admin management
router.get(
  '/:id/manage',
  authenticate,
  ensureUser,
  loadUser,
  async (req, res, next) => {
    try {
      if (!checkAdminRole(req.user.role)) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const quiz = await prisma.quiz.findUnique({
        where: { id: req.params.id },
        include: {
          category: true,
          questions: {
            orderBy: { order: 'asc' },
            include: {
              answerOptions: {
                orderBy: { order: 'asc' },
              },
            },
          },
        },
      });

      if (!quiz) {
        return res.status(404).json({ error: 'Quiz not found' });
      }

      res.json({ data: quiz });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/quizzes - Create quiz (admin only)
router.post(
  '/',
  authenticate,
  ensureUser,
  loadUser,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').optional().trim(),
    body('categoryId').optional().isString(),
    body('timer').optional().isInt({ min: 0 }),
    body('difficulty')
      .optional()
      .isIn(['EASY', 'MEDIUM', 'HARD', 'easy', 'medium', 'hard'])
      .withMessage('Invalid difficulty'),
    body('isPublished').optional().isBoolean(),
  ],
  validate,
  async (req, res, next) => {
    try {
      if (!checkAdminRole(req.user.role)) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { title, description, categoryId, timer, difficulty, isPublished } =
        req.body;

      const quiz = await prisma.quiz.create({
        data: {
          title,
          description,
          categoryId,
          timer,
          difficulty: difficulty?.toUpperCase() || 'MEDIUM',
          isPublished: isPublished ?? false,
          createdBy: req.auth.userId,
        },
        include: {
          category: {
            select: { id: true, name: true },
          },
        },
      });

      res.status(201).json({ data: quiz });
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/quizzes/:id - Update quiz (admin only)
router.put(
  '/:id',
  authenticate,
  ensureUser,
  loadUser,
  [
    body('title').optional().trim().notEmpty(),
    body('description').optional().trim(),
    body('categoryId').optional().isString(),
    body('timer').optional().isInt({ min: 0 }),
    body('difficulty').optional().isIn(['EASY', 'MEDIUM', 'HARD', 'easy', 'medium', 'hard']),
    body('isPublished').optional().isBoolean(),
  ],
  validate,
  async (req, res, next) => {
    try {
      if (!checkAdminRole(req.user.role)) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { title, description, categoryId, timer, difficulty, isPublished } =
        req.body;

      const quiz = await prisma.quiz.update({
        where: { id: req.params.id },
        data: {
          ...(title !== undefined && { title }),
          ...(description !== undefined && { description }),
          ...(categoryId !== undefined && { categoryId }),
          ...(timer !== undefined && { timer }),
          ...(difficulty !== undefined && { difficulty: difficulty.toUpperCase() }),
          ...(isPublished !== undefined && { isPublished }),
        },
        include: {
          category: {
            select: { id: true, name: true },
          },
        },
      });

      res.json({ data: quiz });
    } catch (err) {
      if (err.code === 'P2025') {
        return res.status(404).json({ error: 'Quiz not found' });
      }
      next(err);
    }
  }
);

// DELETE /api/quizzes/:id - Delete quiz (admin only)
router.delete(
  '/:id',
  authenticate,
  ensureUser,
  loadUser,
  async (req, res, next) => {
    try {
      if (!checkAdminRole(req.user.role)) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      await prisma.quiz.delete({
        where: { id: req.params.id },
      });

      res.status(204).send();
    } catch (err) {
      if (err.code === 'P2025') {
        return res.status(404).json({ error: 'Quiz not found' });
      }
      next(err);
    }
  }
);

export default router;

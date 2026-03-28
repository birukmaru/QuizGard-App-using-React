import { Router } from 'express';
import { body, validationResult } from 'express-validator';
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

// POST /api/questions - Add question to quiz (admin only)
router.post(
  '/',
  authenticate,
  ensureUser,
  loadUser,
  [
    body('quizId').isUUID().withMessage('Valid quiz ID is required'),
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

      const { quizId, text, order, answerOptions } = req.body;

      // Verify quiz exists
      const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
      });

      if (!quiz) {
        return res.status(404).json({ error: 'Quiz not found' });
      }

      // Get max order if not provided
      let questionOrder = order;
      if (questionOrder === undefined) {
        const maxOrder = await prisma.question.aggregate({
          where: { quizId },
          _max: { order: true },
        });
        questionOrder = (maxOrder._max.order ?? -1) + 1;
      }

      // Create question with answer options
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
          answerOptions: {
            orderBy: { order: 'asc' },
          },
        },
      });

      res.status(201).json({ data: question });
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/questions/:id - Update question (admin only)
router.put(
  '/:id',
  authenticate,
  ensureUser,
  loadUser,
  [
    body('text').optional().trim().notEmpty(),
    body('order').optional().isInt({ min: 0 }),
    body('answerOptions')
      .optional()
      .isArray({ min: 2 })
      .withMessage('At least 2 answer options required'),
  ],
  validate,
  async (req, res, next) => {
    try {
      if (!checkAdminRole(req.user.role)) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { text, order, answerOptions } = req.body;

      // Update question
      const question = await prisma.question.update({
        where: { id: req.params.id },
        data: {
          ...(text !== undefined && { text }),
          ...(order !== undefined && { order }),
        },
        include: {
          answerOptions: {
            orderBy: { order: 'asc' },
          },
        },
      });

      // Update answer options if provided
      if (answerOptions) {
        // Delete existing options and create new ones
        await prisma.answerOption.deleteMany({
          where: { questionId: req.params.id },
        });

        await prisma.answerOption.createMany({
          data: answerOptions.map((opt, idx) => ({
            questionId: req.params.id,
            text: opt.text,
            isCorrect: opt.isCorrect ?? false,
            order: opt.order ?? idx,
          })),
        });

        // Fetch updated question with options
        const updated = await prisma.question.findUnique({
          where: { id: req.params.id },
          include: {
            answerOptions: {
              orderBy: { order: 'asc' },
            },
          },
        });

        return res.json({ data: updated });
      }

      res.json({ data: question });
    } catch (err) {
      if (err.code === 'P2025') {
        return res.status(404).json({ error: 'Question not found' });
      }
      next(err);
    }
  }
);

// DELETE /api/questions/:id - Delete question (admin only)
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

      await prisma.question.delete({
        where: { id: req.params.id },
      });

      res.status(204).send();
    } catch (err) {
      if (err.code === 'P2025') {
        return res.status(404).json({ error: 'Question not found' });
      }
      next(err);
    }
  }
);

// POST /api/questions/:id/bookmark - Toggle bookmark for a question
router.post(
  '/:id/bookmark',
  authenticate,
  ensureUser,
  loadUser,
  async (req, res, next) => {
    try {
      const questionId = req.params.id;
      const userId = req.user.id;

      // Check if bookmark exists
      const existing = await prisma.bookmark.findUnique({
        where: {
          userId_questionId: { userId, questionId },
        },
      });

      if (existing) {
        // Remove bookmark
        await prisma.bookmark.delete({
          where: { id: existing.id },
        });
        return res.json({ data: { bookmarked: false } });
      }

      // Add bookmark
      await prisma.bookmark.create({
        data: { userId, questionId },
      });

      res.json({ data: { bookmarked: true } });
    } catch (err) {
      next(err);
    }
  }
);

export default router;

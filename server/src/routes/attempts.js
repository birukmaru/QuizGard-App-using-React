import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';
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

// POST /api/attempts - Submit quiz attempt
router.post(
  '/',
  authenticate,
  ensureUser,
  loadUser,
  [
    body('quizId').isUUID().withMessage('Valid quiz ID is required'),
    body('answers')
      .isArray()
      .withMessage('Answers must be an array'),
    body('answers.*.questionId').isUUID().withMessage('Valid question ID required'),
    body('answers.*.selectedOptionId')
      .isUUID()
      .withMessage('Valid option ID required'),
    body('timeSpent').optional().isInt({ min: 0 }),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { quizId, answers, timeSpent } = req.body;
      const userId = req.user.id;

      // Get quiz with questions and correct answers
      const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
        include: {
          questions: {
            include: {
              answerOptions: true,
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

      // Calculate score
      let score = 0;
      const correctAnswers = new Map();

      // Build map of correct answers
      quiz.questions.forEach((q) => {
        const correctOpt = q.answerOptions.find((opt) => opt.isCorrect);
        if (correctOpt) {
          correctAnswers.set(q.id, correctOpt.id);
        }
      });

      // Check each answer
      const answerResults = answers.map((answer) => {
        const correctOptionId = correctAnswers.get(answer.questionId);
        const isCorrect = correctOptionId === answer.selectedOptionId;

        if (isCorrect) {
          score++;
        }

        return {
          questionId: answer.questionId,
          selectedOptionId: answer.selectedOptionId,
          isCorrect,
        };
      });

      // Create attempt record
      const attempt = await prisma.quizAttempt.create({
        data: {
          userId,
          quizId,
          score,
          totalQuestions: quiz.questions.length,
          timeSpent,
          completedAt: new Date(),
        },
      });

      res.status(201).json({
        data: {
          id: attempt.id,
          quizId,
          score,
          totalQuestions: quiz.questions.length,
          percentage: Math.round((score / quiz.questions.length) * 100),
          timeSpent,
          completedAt: attempt.completedAt,
          answers: answerResults,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/attempts - Get user's quiz attempts
router.get(
  '/',
  authenticate,
  ensureUser,
  loadUser,
  async (req, res, next) => {
    try {
      const { quizId, page = '1', limit = '10' } = req.query;
      const userId = req.user.id;

      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
      const skip = (pageNum - 1) * limitNum;

      const where = { userId };
      if (quizId) {
        where.quizId = quizId;
      }

      const [attempts, total] = await Promise.all([
        prisma.quizAttempt.findMany({
          where,
          skip,
          take: limitNum,
          orderBy: { completedAt: 'desc' },
          include: {
            quiz: {
              select: {
                id: true,
                title: true,
                difficulty: true,
              },
            },
          },
        }),
        prisma.quizAttempt.count({ where }),
      ]);

      res.json({
        data: attempts.map((attempt) => ({
          id: attempt.id,
          quizId: attempt.quizId,
          quizTitle: attempt.quiz.title,
          difficulty: attempt.quiz.difficulty,
          score: attempt.score,
          totalQuestions: attempt.totalQuestions,
          percentage: Math.round((attempt.score / attempt.totalQuestions) * 100),
          timeSpent: attempt.timeSpent,
          startedAt: attempt.startedAt,
          completedAt: attempt.completedAt,
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
  }
);

// GET /api/attempts/:id - Get specific attempt details
router.get(
  '/:id',
  authenticate,
  ensureUser,
  loadUser,
  async (req, res, next) => {
    try {
      const attempt = await prisma.quizAttempt.findUnique({
        where: { id: req.params.id },
        include: {
          quiz: {
            include: {
              questions: {
                include: {
                  answerOptions: true,
                },
              },
            },
          },
        },
      });

      if (!attempt) {
        return res.status(404).json({ error: 'Attempt not found' });
      }

      // Only allow user to see their own attempts (or admin)
      if (attempt.userId !== req.user.id && req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json({
        data: {
          id: attempt.id,
          quizId: attempt.quizId,
          quizTitle: attempt.quiz.title,
          score: attempt.score,
          totalQuestions: attempt.totalQuestions,
          percentage: Math.round((attempt.score / attempt.totalQuestions) * 100),
          timeSpent: attempt.timeSpent,
          startedAt: attempt.startedAt,
          completedAt: attempt.completedAt,
          questions: attempt.quiz.questions.map((q) => ({
            id: q.id,
            text: q.text,
            answerOptions: q.answerOptions.map((opt) => ({
              id: opt.id,
              text: opt.text,
              isCorrect: opt.isCorrect,
            })),
          })),
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;

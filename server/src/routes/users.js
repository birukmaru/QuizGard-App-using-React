import { Router } from 'express';
import { body, query, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';
import { ensureUser, loadUser } from '../middleware/errorHandler.js';

const router = Router();
const prisma = new PrismaClient();

// All user routes require authentication
router.use(authenticate, ensureUser, loadUser);

// Validation helper
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// GET /api/users/profile - Get current user profile
router.get('/profile', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        clerkId: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            quizAttempts: true,
            bookmarks: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      data: {
        id: user.id,
        clerkId: user.clerkId,
        email: user.email,
        username: user.username,
        role: user.role,
        stats: {
          totalAttempts: user._count.quizAttempts,
          bookmarksCount: user._count.bookmarks,
        },
        memberSince: user.createdAt,
        lastUpdated: user.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/users/profile - Update user profile
router.put(
  '/profile',
  [
    body('username')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Username must be between 2 and 50 characters')
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { username, email } = req.body;

      // Check if username is already taken
      if (username) {
        const existingUser = await prisma.user.findFirst({
          where: {
            username,
            NOT: { id: req.user.id },
          },
        });

        if (existingUser) {
          return res.status(409).json({ error: 'Username is already taken' });
        }
      }

      // Check if email is already taken
      if (email) {
        const existingEmail = await prisma.user.findFirst({
          where: {
            email,
            NOT: { id: req.user.id },
          },
        });

        if (existingEmail) {
          return res.status(409).json({ error: 'Email is already taken' });
        }
      }

      const updateData = {};
      if (username !== undefined) updateData.username = username;
      if (email !== undefined) updateData.email = email;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: updateData,
        select: {
          id: true,
          clerkId: true,
          email: true,
          username: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      res.json({
        data: {
          user: updatedUser,
          message: 'Profile updated successfully',
        },
      });
    } catch (err) {
      // Handle Prisma unique constraint errors
      if (err.code === 'P2002') {
        return res.status(409).json({ error: 'Username or email already exists' });
      }
      next(err);
    }
  }
);

// GET /api/users/stats - User statistics
router.get('/stats', async (req, res, next) => {
  try {
    const { period = 'all' } = req.query;

    // Build date filter
    let dateFilter = {};
    if (period !== 'all') {
      const now = new Date();
      let startDate;

      switch (period) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        dateFilter = { completedAt: { gte: startDate } };
      }
    }

    // Get user attempts
    const attempts = await prisma.quizAttempt.findMany({
      where: {
        userId: req.user.id,
        completedAt: { not: null },
        ...dateFilter,
      },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            difficulty: true,
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { completedAt: 'desc' },
    });

    // Calculate statistics
    const totalAttempts = attempts.length;
    const totalScore = attempts.reduce((sum, a) => sum + a.score, 0);
    const totalQuestions = attempts.reduce((sum, a) => sum + a.totalQuestions, 0);
    const totalTimeSpent = attempts.reduce((sum, a) => sum + (a.timeSpent || 0), 0);

    // Average score
    const averageScore = totalAttempts > 0 ? (totalScore / totalQuestions) * 100 : 0;

    // Best and recent scores
    const bestScore = attempts.length > 0
      ? Math.max(...attempts.map((a) => (a.score / a.totalQuestions) * 100))
      : 0;
    const recentScore = attempts.length > 0
      ? (attempts[0].score / attempts[0].totalQuestions) * 100
      : 0;

    // Difficulty breakdown
    const byDifficulty = {
      EASY: { attempts: 0, totalScore: 0, totalQuestions: 0 },
      MEDIUM: { attempts: 0, totalScore: 0, totalQuestions: 0 },
      HARD: { attempts: 0, totalScore: 0, totalQuestions: 0 },
    };

    attempts.forEach((a) => {
      const diff = a.quiz.difficulty;
      byDifficulty[diff].attempts++;
      byDifficulty[diff].totalScore += a.score;
      byDifficulty[diff].totalQuestions += a.totalQuestions;
    });

    const difficultyStats = Object.entries(byDifficulty).map(([difficulty, data]) => ({
      difficulty,
      attempts: data.attempts,
      averageScore: data.totalQuestions > 0
        ? Math.round((data.totalScore / data.totalQuestions) * 100 * 10) / 10
        : 0,
    }));

    // Category breakdown
    const categoryMap = {};
    attempts.forEach((a) => {
      if (a.quiz.category) {
        const catId = a.quiz.category.id;
        if (!categoryMap[catId]) {
          categoryMap[catId] = {
            categoryId: catId,
            categoryName: a.quiz.category.name,
            attempts: 0,
            totalScore: 0,
            totalQuestions: 0,
          };
        }
        categoryMap[catId].attempts++;
        categoryMap[catId].totalScore += a.score;
        categoryMap[catId].totalQuestions += a.totalQuestions;
      }
    });

    const categoryStats = Object.values(categoryMap).map((cat) => ({
      ...cat,
      averageScore: cat.totalQuestions > 0
        ? Math.round((cat.totalScore / cat.totalQuestions) * 100 * 10) / 10
        : 0,
    }));

    // Quiz-specific stats (most attempted)
    const quizMap = {};
    attempts.forEach((a) => {
      const quizId = a.quiz.id;
      if (!quizMap[quizId]) {
        quizMap[quizId] = {
          quizId,
          quizTitle: a.quiz.title,
          attempts: 0,
          bestScore: 0,
          scores: [],
        };
      }
      quizMap[quizId].attempts++;
      const percentage = (a.score / a.totalQuestions) * 100;
      quizMap[quizId].scores.push(percentage);
      quizMap[quizId].bestScore = Math.max(quizMap[quizId].bestScore, percentage);
    });

    const quizStats = Object.values(quizMap)
      .map((quiz) => ({
        quizId: quiz.quizId,
        quizTitle: quiz.quizTitle,
        attempts: quiz.attempts,
        bestScore: Math.round(quiz.bestScore * 10) / 10,
        averageScore: Math.round(
          (quiz.scores.reduce((s, sc) => s + sc, 0) / quiz.scores.length) * 10
        ) / 10,
      }))
      .sort((a, b) => b.attempts - a.attempts);

    // Streak calculation (consecutive days with attempts)
    const uniqueDays = [...new Set(
      attempts.map((a) => a.completedAt.toISOString().split('T')[0])
    )].sort().reverse();

    let currentStreak = 0;
    if (uniqueDays.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      if (uniqueDays[0] === today || uniqueDays[0] === yesterday) {
        currentStreak = 1;
        for (let i = 1; i < uniqueDays.length; i++) {
          const prevDate = new Date(uniqueDays[i - 1]);
          const currDate = new Date(uniqueDays[i]);
          const diffDays = (prevDate - currDate) / (24 * 60 * 60 * 1000);

          if (diffDays === 1) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
    }

    res.json({
      data: {
        overview: {
          totalAttempts,
          averageScore: Math.round(averageScore * 10) / 10,
          bestScore: Math.round(bestScore * 10) / 10,
          recentScore: Math.round(recentScore * 10) / 10,
          totalTimeSpentSeconds: totalTimeSpent,
          totalTimeSpentFormatted: formatTime(totalTimeSpent),
        },
        streak: {
          current: currentStreak,
          totalActiveDays: uniqueDays.length,
        },
        byDifficulty: difficultyStats,
        byCategory: categoryStats,
        byQuiz: quizStats,
        period: period === 'all' ? 'all time' : `last ${period}`,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/users/activity - User activity history
router.get(
  '/activity',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('quizId').optional().isUUID(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { page = 1, limit = 20, quizId } = req.query;
      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
      const skip = (pageNum - 1) * limitNum;

      const where = { userId: req.user.id };
      if (quizId) {
        where.quizId = quizId;
      }

      const [attempts, total, bookmarks] = await Promise.all([
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
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        }),
        prisma.quizAttempt.count({ where }),
        prisma.bookmark.findMany({
          where: { userId: req.user.id },
          orderBy: { createdAt: 'desc' },
          take: limitNum,
          include: {
            question: {
              select: {
                id: true,
                text: true,
                quiz: {
                  select: {
                    id: true,
                    title: true,
                  },
                },
              },
            },
          },
        }),
      ]);

      // Format attempts as activity items
      const activityItems = attempts.map((attempt) => ({
        id: attempt.id,
        type: 'quiz_attempt',
        quizId: attempt.quiz.id,
        quizTitle: attempt.quiz.title,
        category: attempt.quiz.category?.name || null,
        difficulty: attempt.quiz.difficulty,
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
        percentage: Math.round((attempt.score / attempt.totalQuestions) * 100),
        timeSpent: attempt.timeSpent,
        startedAt: attempt.startedAt.toISOString(),
        completedAt: attempt.completedAt?.toISOString() || null,
      }));

      // Format bookmarks as activity items
      const bookmarkItems = bookmarks.map((bookmark) => ({
        id: bookmark.id,
        type: 'bookmark_added',
        questionId: bookmark.question.id,
        questionText: bookmark.question.text,
        quizId: bookmark.question.quiz.id,
        quizTitle: bookmark.question.quiz.title,
        createdAt: bookmark.createdAt.toISOString(),
      }));

      // Combine and sort by date
      const allActivity = [...activityItems, ...bookmarkItems].sort((a, b) => {
        const dateA = a.completedAt || a.startedAt || a.createdAt;
        const dateB = b.completedAt || b.startedAt || b.createdAt;
        return new Date(dateB) - new Date(dateA);
      });

      res.json({
        data: {
          activities: allActivity,
          summary: {
            totalAttempts: total,
            totalBookmarks: await prisma.bookmark.count({ where: { userId: req.user.id } }),
          },
        },
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

// Helper function to format time
function formatTime(seconds) {
  if (!seconds || seconds === 0) return '0m';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 && hours === 0) parts.push(`${secs}s`);

  return parts.join(' ') || '0m';
}

export default router;

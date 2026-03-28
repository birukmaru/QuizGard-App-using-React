import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/leaderboard - Get top scores
router.get('/', async (req, res, next) => {
  try {
    const { quizId, limit = '10', period } = req.query;

    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));

    // Build date filter for period
    let dateFilter = {};
    if (period === 'day') {
      dateFilter = {
        gte: new Date(new Date().setHours(0, 0, 0, 0)),
      };
    } else if (period === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter = { gte: weekAgo };
    } else if (period === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      dateFilter = { gte: monthAgo };
    }

    // Build where clause
    const where = {
      completedAt: { not: null },
      ...(quizId && { quizId }),
      ...(Object.keys(dateFilter).length > 0 && {
        completedAt: dateFilter,
      }),
    };

    // Get top attempts with user info
    const leaderboard = await prisma.quizAttempt.findMany({
      where,
      orderBy: [
        { score: 'desc' },
        { timeSpent: 'asc' }, // Tiebreaker: faster time wins
      ],
      take: limitNum,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        quiz: {
          select: {
            id: true,
            title: true,
            difficulty: true,
          },
        },
      },
    });

    // Calculate rankings and add percentage
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      rank: index + 1,
      userId: entry.user.id,
      username: entry.user.username || entry.user.email?.split('@')[0] || 'Anonymous',
      quizId: entry.quizId,
      quizTitle: entry.quiz.title,
      difficulty: entry.quiz.difficulty,
      score: entry.score,
      totalQuestions: entry.totalQuestions,
      percentage: Math.round((entry.score / entry.totalQuestions) * 100),
      timeSpent: entry.timeSpent,
      completedAt: entry.completedAt,
    }));

    res.json({ data: rankedLeaderboard });
  } catch (err) {
    next(err);
  }
});

// GET /api/leaderboard/quiz/:quizId - Leaderboard for specific quiz
router.get('/quiz/:quizId', async (req, res, next) => {
  try {
    const { limit = '10' } = req.query;
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));

    const leaderboard = await prisma.quizAttempt.findMany({
      where: {
        quizId: req.params.quizId,
        completedAt: { not: null },
      },
      orderBy: [
        { score: 'desc' },
        { timeSpent: 'asc' },
      ],
      take: limitNum,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      rank: index + 1,
      userId: entry.user.id,
      username: entry.user.username || entry.user.email?.split('@')[0] || 'Anonymous',
      score: entry.score,
      totalQuestions: entry.totalQuestions,
      percentage: Math.round((entry.score / entry.totalQuestions) * 100),
      timeSpent: entry.timeSpent,
      completedAt: entry.completedAt,
    }));

    res.json({ data: rankedLeaderboard });
  } catch (err) {
    next(err);
  }
});

// GET /api/leaderboard/user/:userId - User's ranking across all quizzes
router.get('/user/:userId', async (req, res, next) => {
  try {
    const { quizId, limit = '10' } = req.query;
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));

    // Get user's attempts
    const userAttempts = await prisma.quizAttempt.findMany({
      where: {
        userId: req.params.userId,
        completedAt: { not: null },
        ...(quizId && { quizId }),
      },
      orderBy: [
        { score: 'desc' },
        { timeSpent: 'asc' },
      ],
      take: limitNum,
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            difficulty: true,
          },
        },
      },
    });

    // Get total unique users who have completed this quiz
    const totalParticipants = await prisma.quizAttempt.groupBy({
      by: ['userId'],
      where: {
        quizId: quizId || undefined,
        completedAt: { not: null },
      },
    });

    res.json({
      data: {
        totalQuizzesCompleted: userAttempts.length,
        totalParticipants: totalParticipants.length,
        bestAttempts: userAttempts.map((entry, index) => ({
          rank: index + 1,
          quizId: entry.quizId,
          quizTitle: entry.quiz.title,
          difficulty: entry.quiz.difficulty,
          score: entry.score,
          totalQuestions: entry.totalQuestions,
          percentage: Math.round((entry.score / entry.totalQuestions) * 100),
          timeSpent: entry.timeSpent,
          completedAt: entry.completedAt,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;

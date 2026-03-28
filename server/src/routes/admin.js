import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';
import { ensureUser, loadUser, requireAdmin } from '../middleware/errorHandler.js';

const router = Router();
const prisma = new PrismaClient();

// All admin routes require authentication and admin role
router.use(authenticate, ensureUser, loadUser, requireAdmin);

// GET /api/admin/stats - Dashboard statistics
router.get('/stats', async (_req, res, next) => {
  try {
    const [totalUsers, totalQuizzes, totalAttempts, activeUsers] = await Promise.all([
      prisma.user.count(),
      prisma.quiz.count({ where: { isPublished: true } }),
      prisma.quizAttempt.count(),
      // Users with activity in the last 7 days
      prisma.user.count({
        where: {
          quizAttempts: {
            some: {
              completedAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              },
            },
          },
        },
      }),
    ]);

    // Get completion rate (completed attempts / total attempts)
    const completedAttempts = await prisma.quizAttempt.count({
      where: { completedAt: { not: null } },
    });

    // Average score from completed attempts
    const scoreAggregation = await prisma.quizAttempt.aggregate({
      where: { completedAt: { not: null } },
      _avg: {
        score: true,
      },
      _count: true,
    });

    res.json({
      data: {
        totalUsers,
        totalQuizzes,
        totalAttempts,
        activeUsers,
        completionRate: totalAttempts > 0 ? Math.round((completedAttempts / totalAttempts) * 100) : 0,
        averageScore: scoreAggregation._avg.score ? Math.round(scoreAggregation._avg.score * 10) / 10 : 0,
        totalCompleted: completedAttempts,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/analytics/users - User growth data
router.get('/analytics/users', async (req, res, next) => {
  try {
    const { days = '30' } = req.query;
    const daysNum = Math.min(365, Math.max(7, parseInt(days, 10)));
    const startDate = new Date(Date.now() - daysNum * 24 * 60 * 60 * 1000);

    // Get user registrations grouped by day
    const userRegistrations = await prisma.user.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    // Group by date
    const registrationsByDay = {};
    userRegistrations.forEach((user) => {
      const dateKey = user.createdAt.toISOString().split('T')[0];
      registrationsByDay[dateKey] = (registrationsByDay[dateKey] || 0) + 1;
    });

    // Get total users before period
    const usersBeforePeriod = await prisma.user.count({
      where: { createdAt: { lt: startDate } },
    });

    // Build cumulative data
    let cumulative = usersBeforePeriod;
    const growthData = Object.entries(registrationsByDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, newUsers]) => {
        cumulative += newUsers;
        return {
          date,
          newUsers,
          totalUsers: cumulative,
        };
      });

    // Get user role distribution
    const roleDistribution = await prisma.user.groupBy({
      by: ['role'],
      _count: true,
    });

    res.json({
      data: {
        period: { days: daysNum, startDate: startDate.toISOString() },
        totalUsers: usersBeforePeriod + userRegistrations.length,
        growth: growthData,
        distribution: roleDistribution.reduce((acc, item) => {
          acc[item.role] = item._count;
          return acc;
        }, {}),
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/analytics/quizzes - Quiz performance data
router.get('/analytics/quizzes', async (req, res, next) => {
  try {
    const { limit = '10' } = req.query;
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));

    // Get quiz performance metrics
    const quizPerformance = await prisma.quiz.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        title: true,
        difficulty: true,
        _count: {
          select: { attempts: true },
        },
        attempts: {
          where: { completedAt: { not: null } },
          select: {
            score: true,
            totalQuestions: true,
            timeSpent: true,
          },
        },
      },
      take: limitNum,
    });

    const performanceData = quizPerformance.map((quiz) => {
      const completedAttempts = quiz.attempts.filter((a) => a.completedAt !== undefined);
      const averageScore = completedAttempts.length > 0
        ? completedAttempts.reduce((sum, a) => sum + (a.score / a.totalQuestions) * 100, 0) / completedAttempts.length
        : 0;
      const averageTime = completedAttempts.length > 0
        ? completedAttempts.reduce((sum, a) => sum + (a.timeSpent || 0), 0) / completedAttempts.length
        : 0;

      return {
        quizId: quiz.id,
        title: quiz.title,
        difficulty: quiz.difficulty,
        totalAttempts: quiz._count.attempts,
        completedAttempts: completedAttempts.length,
        averageScore: Math.round(averageScore * 10) / 10,
        averageTimeSeconds: Math.round(averageTime),
      };
    });

    // Sort by total attempts
    performanceData.sort((a, b) => b.totalAttempts - a.totalAttempts);

    // Overall stats
    const overallStats = await prisma.quizAttempt.aggregate({
      where: { completedAt: { not: null } },
      _avg: {
        score: true,
        timeSpent: true,
      },
      _count: true,
    });

    res.json({
      data: {
        topPerformers: performanceData.slice(0, limitNum),
        overall: {
          totalCompletedAttempts: overallStats._count,
          averageScore: overallStats._avg.score
            ? Math.round(overallStats._avg.score * 10) / 10
            : 0,
          averageTimeSeconds: overallStats._avg.timeSpent
            ? Math.round(overallStats._avg.timeSpent)
            : 0,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/analytics/categories - Category distribution
router.get('/analytics/categories', async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { quizzes: true },
        },
        quizzes: {
          where: { isPublished: true },
          include: {
            _count: {
              select: { attempts: true },
            },
            attempts: {
              where: { completedAt: { not: null } },
              select: {
                score: true,
                totalQuestions: true,
              },
            },
          },
        },
      },
    });

    const distribution = categories.map((category) => {
      const totalQuizzes = category.quizzes.length;
      const totalAttempts = category.quizzes.reduce((sum, q) => sum + q._count.attempts, 0);
      const completedAttempts = category.quizzes.flatMap((q) => q.attempts);
      const averageScore = completedAttempts.length > 0
        ? completedAttempts.reduce((sum, a) => sum + (a.score / a.totalQuestions) * 100, 0) / completedAttempts.length
        : 0;

      return {
        categoryId: category.id,
        name: category.name,
        description: category.description,
        icon: category.icon,
        totalQuizzes,
        totalAttempts,
        averageScore: Math.round(averageScore * 10) / 10,
        isActive: category.isActive,
      };
    });

    // Sort by total attempts
    distribution.sort((a, b) => b.totalAttempts - a.totalAttempts);

    // Overall stats
    const totalQuizzes = distribution.reduce((sum, c) => sum + c.totalQuizzes, 0);
    const totalAttempts = distribution.reduce((sum, c) => sum + c.totalAttempts, 0);

    res.json({
      data: {
        distribution,
        summary: {
          totalCategories: categories.length,
          activeCategories: categories.filter((c) => c.isActive).length,
          totalQuizzes,
          totalAttempts,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/activity - Recent activity
router.get('/activity', async (req, res, next) => {
  try {
    const { limit = '20', type = 'all' } = req.query;
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));

    const recentAttempts = await prisma.quizAttempt.findMany({
      take: limitNum,
      orderBy: { completedAt: 'desc' },
      where: { completedAt: { not: null } },
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
          },
        },
      },
    });

    // Format as activity feed
    const activities = recentAttempts
      .filter((a) => a.completedAt)
      .map((attempt) => ({
        id: `attempt-${attempt.id}`,
        type: 'quiz_completed',
        userId: attempt.user.id,
        username: attempt.user.username || attempt.user.email,
        data: {
          quizId: attempt.quiz.id,
          quizTitle: attempt.quiz.title,
          score: attempt.score,
          totalQuestions: attempt.totalQuestions,
          percentage: Math.round((attempt.score / attempt.totalQuestions) * 100),
        },
        timestamp: attempt.completedAt.toISOString(),
      }));

    // If type is not 'all', filter accordingly
    const filteredActivities = type === 'all'
      ? activities
      : activities.filter((a) => a.type === type);

    // Get recent user registrations
    const recentUsers = await prisma.user.findMany({
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
    });

    const userActivities = recentUsers.map((user) => ({
      id: `user-${user.id}`,
      type: 'user_registered',
      userId: user.id,
      username: user.username || user.email,
      data: {
        email: user.email,
      },
      timestamp: user.createdAt.toISOString(),
    }));

    // Combine and sort by timestamp
    const allActivities = [...activities, ...userActivities]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limitNum);

    res.json({
      data: {
        activities: type === 'users' ? userActivities : type === 'quizzes' ? activities : allActivities,
        summary: {
          recentAttempts: recentAttempts.length,
          recentUsers: recentUsers.length,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;

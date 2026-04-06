import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Spinner } from '@/components/ui';
import { Sidebar, SidebarProvider, useSidebar } from '@/components/layout';
import { useAuth } from '@/hooks';
import { userApi, quizzesApi, attemptsApi } from '@/lib/api';
import { cn, formatDate, formatRelativeTime, getGrade } from '@/lib/utils';
import {
  LayoutDashboard,
  BookOpen,
  Trophy,
  TrendingUp,
  Clock,
  Target,
  Award,
  Play,
  ArrowRight,
  Flame,
  Calendar,
  ChevronRight,
  BarChart3,
  Star,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const DashboardContent = ({ hasSidebar = false }) => {
  const { user, userStats, userProfile, isAdmin } = useAuth();
  const { collapsed } = hasSidebar ? useSidebar() : { collapsed: false };
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentAttempts, setRecentAttempts] = useState([]);
  const [recommendedQuizzes, setRecommendedQuizzes] = useState([]);
  const [activityData, setActivityData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, attemptsData, quizzesData] = await Promise.all([
          userApi.getStats().catch(() => null),
          attemptsApi.getUserAttempts({ limit: 5 }).catch(() => []),
          quizzesApi.getAll({ limit: 4, sort: 'popular' }).catch(() => []),
        ]);

        setStats(statsData);
        setRecentAttempts(Array.isArray(attemptsData) ? attemptsData.slice(0, 5) : []);
        setRecommendedQuizzes(Array.isArray(quizzesData) ? quizzesData.slice(0, 4) : []);

        // Generate mock activity data for chart
        setActivityData(
          Array.from({ length: 7 }, (_, i) => ({
            day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][(new Date().getDay() - 6 + i + 7) % 7],
            quizzes: Math.floor(Math.random() * 5) + 1,
            score: Math.floor(Math.random() * 30) + 70,
          }))
        );
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    {
      title: 'Quizzes Completed',
      value: stats?.quizzesCompleted || userStats?.quizzesCompleted || 0,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      title: 'Average Score',
      value: `${stats?.averageScore || userStats?.averageScore || 0}%`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      title: 'Current Streak',
      value: `${stats?.currentStreak || userStats?.currentStreak || 0} days`,
      icon: Flame,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    },
    {
      title: 'Total Points',
      value: stats?.totalPoints || userStats?.totalPoints || 0,
      icon: Award,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" label="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.firstName || 'Quizzer'}!
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Here is what you have been up to lately
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                  <div className={cn('p-3 rounded-xl', stat.bgColor)}>
                    <stat.icon className={cn('h-6 w-6', stat.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts and Activity */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          {/* Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Weekly Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                    <XAxis
                      dataKey="day"
                      className="text-xs"
                      tick={{ fill: 'currentColor' }}
                    />
                    <YAxis
                      className="text-xs"
                      tick={{ fill: 'currentColor' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--tooltip-bg, #fff)',
                        borderColor: 'var(--tooltip-border, #e5e7eb)',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="quizzes"
                      stroke="#3498db"
                      fill="#3498db"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Performance Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Score Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Excellent (90%+)', value: 35, color: '#22c55e' },
                        { name: 'Good (70-89%)', value: 40, color: '#3b82f6' },
                        { name: 'Average (50-69%)', value: 20, color: '#f59e0b' },
                        { name: 'Below (50%)', value: 5, color: '#ef4444' },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {[0, 1, 2, 3].map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={[
                            '#22c55e',
                            '#3b82f6',
                            '#f59e0b',
                            '#ef4444',
                          ][index]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {[
                  { label: 'Excellent', color: 'bg-green-500', percent: '35%' },
                  { label: 'Good', color: 'bg-blue-500', percent: '40%' },
                  { label: 'Average', color: 'bg-yellow-500', percent: '20%' },
                  { label: 'Below', color: 'bg-red-500', percent: '5%' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className={cn('h-3 w-3 rounded-full', item.color)} />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {item.label} ({item.percent})
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity and Recommended */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Attempts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <Link to="/history">
                <Button variant="ghost" size="sm" rightIcon={<ChevronRight className="h-4 w-4" />}>
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentAttempts.length > 0 ? (
                <div className="space-y-4">
                  {recentAttempts.map((attempt) => {
                    const grade = getGrade(attempt.score || 0);
                    return (
                      <Link
                        key={attempt.id}
                        to={`/result/${attempt.id}`}
                        className="flex items-center gap-4 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                      >
                        <div
                          className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-lg',
                            'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                          )}
                        >
                          <BookOpen className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {attempt.quiz?.title || 'Quiz'}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatRelativeTime(attempt.completedAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={
                              grade.letter === 'A' || grade.letter === 'B'
                                ? 'success'
                                : grade.letter === 'C'
                                  ? 'warning'
                                  : 'danger'
                            }
                          >
                            {attempt.score}%
                          </Badge>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {attempt.correctAnswers}/{attempt.totalQuestions}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
                  <p className="mt-4 text-gray-500 dark:text-gray-400">
                    No quiz attempts yet
                  </p>
                  <Link to="/categories">
                    <Button className="mt-4" size="sm">
                      Start Your First Quiz
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recommended Quizzes */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Recommended for You
              </CardTitle>
              <Link to="/categories">
                <Button variant="ghost" size="sm" rightIcon={<ChevronRight className="h-4 w-4" />}>
                  Browse More
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recommendedQuizzes.length > 0 ? (
                <div className="space-y-4">
                  {recommendedQuizzes.map((quiz) => (
                    <Link
                      key={quiz.id}
                      to={`/quiz/${quiz.id}`}
                      className="flex items-center gap-4 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                    >
                      <div
                        className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-lg',
                          'bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400'
                        )}
                      >
                        <Play className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {quiz.title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {quiz.category?.name || 'General'} &bull; {quiz.questionCount || 0} questions
                        </p>
                      </div>
                      <Badge variant="subtle">{quiz.difficulty || 'Medium'}</Badge>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
                  <p className="mt-4 text-gray-500 dark:text-gray-400">
                    No recommendations yet
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            Quick Actions
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Link to="/categories">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <BookOpen className="mx-auto h-8 w-8 text-primary-600" />
                  <p className="mt-2 font-medium text-gray-900 dark:text-white">
                    Browse Categories
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Explore all quiz topics
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link to="/leaderboard">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <Trophy className="mx-auto h-8 w-8 text-yellow-500" />
                  <p className="mt-2 font-medium text-gray-900 dark:text-white">
                    View Leaderboard
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    See top performers
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link to="/history">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <BarChart3 className="mx-auto h-8 w-8 text-green-600" />
                  <p className="mt-2 font-medium text-gray-900 dark:text-white">
                    View History
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Review past attempts
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  return (
    <SidebarProvider>
      <DashboardWithSidebar />
    </SidebarProvider>
  );
};

const DashboardWithSidebar = () => {
  const { collapsed } = useSidebar();
  return (
    <div className="flex">
      <Sidebar />
      <div className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'}`}>
        <DashboardContent hasSidebar />
      </div>
    </div>
  );
};

export default Dashboard;
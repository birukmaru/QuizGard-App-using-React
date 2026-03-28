import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, Button, Badge, Spinner, Select } from '@/components/ui';
import { Sidebar, SidebarProvider, useSidebar } from '@/components/layout';
import { attemptsApi } from '@/lib/api';
import { cn, formatDate, formatRelativeTime, getGrade } from '@/lib/utils';
import {
  Clock,
  BookOpen,
  Target,
  Filter,
  ChevronRight,
  Trophy,
  TrendingUp,
  Calendar,
} from 'lucide-react';

const HistoryContent = () => {
  const { collapsed } = useSidebar();
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const data = await attemptsApi.getHistory({ sort: sortBy });
        setAttempts(data);
      } catch (error) {
        console.error('Failed to fetch history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [sortBy]);

  const filteredAttempts = attempts.filter((attempt) => {
    if (filter === 'all') return true;
    const grade = getGrade(attempt.percentage);
    if (filter === 'passed') return attempt.percentage >= 60;
    if (filter === 'failed') return attempt.percentage < 60;
    return true;
  });

  const stats = {
    total: attempts.length,
    passed: attempts.filter((a) => a.percentage >= 60).length,
    avgScore: attempts.length
      ? Math.round(attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / attempts.length)
      : 0,
    bestScore: attempts.length ? Math.max(...attempts.map((a) => a.percentage || 0)) : 0,
  };

  const filterOptions = [
    { value: 'all', label: 'All Attempts' },
    { value: 'passed', label: 'Passed' },
    { value: 'failed', label: 'Failed' },
  ];

  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'score', label: 'Highest Score' },
    { value: 'oldest', label: 'Oldest First' },
  ];

  return (
    <div className="flex">
      <Sidebar />
      <main className={cn('flex-1 p-6 transition-all duration-300', collapsed ? 'ml-0' : '')}>
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Quiz History
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              View and review all your quiz attempts
            </p>
          </div>

          {/* Stats */}
          <div className="mb-8 grid gap-4 sm:grid-cols-4">
            <Card>
              <CardContent className="p-4 text-center">
                <BookOpen className="mx-auto h-6 w-6 text-primary-600" />
                <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.total}
                </p>
                <p className="text-sm text-gray-500">Total Attempts</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Trophy className="mx-auto h-6 w-6 text-yellow-500" />
                <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.passed}
                </p>
                <p className="text-sm text-gray-500">Passed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="mx-auto h-6 w-6 text-success-600" />
                <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.avgScore}%
                </p>
                <p className="text-sm text-gray-500">Average Score</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Target className="mx-auto h-6 w-6 text-primary-600" />
                <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.bestScore}%
                </p>
                <p className="text-sm text-gray-500">Best Score</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <Select
              options={filterOptions}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              containerClassName="w-full sm:w-48"
            />
            <Select
              options={sortOptions}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              containerClassName="w-full sm:w-48"
            />
          </div>

          {/* History List */}
          {loading ? (
            <div className="flex justify-center py-16">
              <Spinner size="lg" label="Loading history..." />
            </div>
          ) : filteredAttempts.length === 0 ? (
            <Card className="text-center py-16">
              <Clock className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                No quiz history yet
              </h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                {filter !== 'all'
                  ? 'No quizzes match your filter criteria'
                  : 'Start taking quizzes to see your history here'}
              </p>
              <Link to="/categories">
                <Button className="mt-6">Browse Categories</Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredAttempts.map((attempt) => {
                const grade = getGrade(attempt.percentage);
                const isPassed = attempt.percentage >= 60;
                return (
                  <Link key={attempt.id} to={`/result/${attempt.id}`}>
                    <Card
                      className={cn(
                        'transition-all duration-200 hover:shadow-lg cursor-pointer',
                        'border-l-4',
                        isPassed ? 'border-l-success-500' : 'border-l-danger-500'
                      )}
                    >
                      <CardContent className="p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-start gap-4">
                            <div
                              className={cn(
                                'flex h-12 w-12 items-center justify-center rounded-xl',
                                'bg-gray-100 dark:bg-gray-800'
                              )}
                            >
                              <BookOpen className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {attempt.quiz?.title || 'Quiz'}
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {attempt.quiz?.category?.name || 'General'} &bull;{' '}
                                {formatRelativeTime(attempt.completedAt)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <div className="flex items-center gap-2">
                                <span
                                  className={cn(
                                    'text-2xl font-bold',
                                    grade.letter === 'A' || grade.letter === 'B'
                                      ? 'text-success-600'
                                      : grade.letter === 'C'
                                        ? 'text-warning-600'
                                        : 'text-danger-600'
                                  )}
                                >
                                  {attempt.percentage}%
                                </span>
                                <Badge
                                  variant={
                                    grade.letter === 'A' || grade.letter === 'B'
                                      ? 'success'
                                      : grade.letter === 'C'
                                        ? 'warning'
                                        : 'danger'
                                  }
                                >
                                  {grade.letter}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-500">
                                {attempt.correctAnswers}/{attempt.totalQuestions} correct
                              </p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const History = () => {
  return (
    <SidebarProvider>
      <HistoryContent />
    </SidebarProvider>
  );
};

export default History;

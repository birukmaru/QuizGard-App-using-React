import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, Button, Badge, Spinner, Select } from '@/components/ui';
import { Footer } from '@/components/layout';
import { leaderboardApi } from '@/lib/api';
import { useAuth } from '@/hooks';
import { cn, formatNumber } from '@/lib/utils';
import {
  Trophy,
  Medal,
  Award,
  Crown,
  Flame,
  TrendingUp,
  Users,
  ChevronRight,
  Star,
  ChevronLeft,
} from 'lucide-react';

const Leaderboard = () => {
  const { isSignedIn, user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState('global');
  const [timeRange, setTimeRange] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const data =
          scope === 'global'
            ? await leaderboardApi.getGlobal({ timeRange, page: currentPage, pageSize })
            : await leaderboardApi.getGlobal({ timeRange, page: currentPage, pageSize });
        setEntries(data);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [scope, timeRange, currentPage]);

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-amber-600" />;
    return <span className="text-lg font-bold text-gray-500">{rank}</span>;
  };

  const getRankStyle = (rank) => {
    if (rank === 1)
      return 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 dark:from-yellow-900/20 dark:to-yellow-800/20 dark:border-yellow-800';
    if (rank === 2)
      return 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 dark:from-gray-800/50 dark:to-gray-700/50 dark:border-gray-600';
    if (rank === 3)
      return 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 dark:from-amber-900/20 dark:to-amber-800/20 dark:border-amber-800';
    return '';
  };

  const scopeOptions = [
    { value: 'global', label: 'Global' },
    { value: 'friends', label: 'Friends' },
  ];

  const timeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'month', label: 'This Month' },
    { value: 'week', label: 'This Week' },
  ];

  const currentUserRank = entries.find((e) => e.userId === user?.id)?.rank;
  const currentUserEntry = entries.find((e) => e.userId === user?.id);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 py-12 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <Trophy className="mx-auto h-12 w-12 text-yellow-400" />
            <h1 className="mt-4 text-4xl font-bold text-white">Leaderboard</h1>
            <p className="mt-2 text-lg text-primary-100">
              Compete with others and climb to the top!
            </p>
          </div>

          {/* Filters */}
          <div className="mt-8 flex justify-center gap-4 flex-wrap">
            <Select
              options={scopeOptions}
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              containerClassName="w-40"
            />
            <Select
              options={timeOptions}
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              containerClassName="w-40"
            />
          </div>
        </div>
      </section>

      {/* Current User Card */}
      {isSignedIn && currentUserEntry && (
        <section className="bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <div className="mx-auto max-w-7xl px-4 py-4">
            <Card className="bg-primary-50 border-primary-200 dark:bg-primary-900/20 dark:border-primary-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-white font-bold">
                      #{currentUserRank || '--'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        Your Position
                      </p>
                      <p className="text-sm text-gray-500">
                        Keep playing to improve your rank!
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary-600">
                      {formatNumber(currentUserEntry.points || 0)}
                    </p>
                    <p className="text-sm text-gray-500">points</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Leaderboard */}
      <section className="flex-1 py-8">
        <div className="mx-auto max-w-4xl px-4">
          {loading ? (
            <div className="flex justify-center py-16">
              <Spinner size="lg" label="Loading leaderboard..." />
            </div>
          ) : entries.length === 0 ? (
            <Card className="text-center py-16">
              <Users className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                No entries yet
              </h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Be the first to take a quiz and join the leaderboard!
              </p>
              <Link to="/categories">
                <Button className="mt-6">Start Playing</Button>
              </Link>
            </Card>
          ) : (
            <>
              {/* Top 3 Podium */}
              {currentPage === 1 && entries.length >= 3 && (
                <div className="mb-8">
                  <div className="flex items-end justify-center gap-4">
                    {/* 2nd Place */}
                    <div className="text-center">
                      <div className="relative">
                        <Avatar
                          src={entries[1]?.avatar}
                          alt={entries[1]?.name}
                          className="h-16 w-16 mx-auto border-4 border-gray-300"
                        />
                        <Medal className="absolute -top-2 -right-2 h-6 w-6 text-gray-400" />
                      </div>
                      <p className="mt-2 font-semibold text-gray-900 dark:text-white truncate max-w-[100px]">
                        {entries[1]?.name || 'User'}
                      </p>
                      <p className="text-sm text-gray-500">{formatNumber(entries[1]?.points || 0)}</p>
                      <div className="mt-2 h-24 w-20 mx-auto bg-gray-200 dark:bg-gray-700 rounded-t-lg flex items-end justify-center">
                        <span className="text-2xl font-bold text-gray-500 mb-2">2</span>
                      </div>
                    </div>

                    {/* 1st Place */}
                    <div className="text-center">
                      <div className="relative">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                          <Crown className="h-8 w-8 text-yellow-500" />
                        </div>
                        <Avatar
                          src={entries[0]?.avatar}
                          alt={entries[0]?.name}
                          className="h-20 w-20 mx-auto border-4 border-yellow-400"
                        />
                      </div>
                      <p className="mt-2 font-semibold text-gray-900 dark:text-white truncate max-w-[120px]">
                        {entries[0]?.name || 'User'}
                      </p>
                      <p className="text-sm text-gray-500">{formatNumber(entries[0]?.points || 0)}</p>
                      <div className="mt-2 h-32 w-24 mx-auto bg-gradient-to-t from-yellow-400 to-yellow-200 rounded-t-lg flex items-end justify-center dark:from-yellow-600 dark:to-yellow-400">
                        <span className="text-3xl font-bold text-white mb-3">1</span>
                      </div>
                    </div>

                    {/* 3rd Place */}
                    <div className="text-center">
                      <div className="relative">
                        <Avatar
                          src={entries[2]?.avatar}
                          alt={entries[2]?.name}
                          className="h-16 w-16 mx-auto border-4 border-amber-600"
                        />
                        <Medal className="absolute -top-2 -right-2 h-6 w-6 text-amber-600" />
                      </div>
                      <p className="mt-2 font-semibold text-gray-900 dark:text-white truncate max-w-[100px]">
                        {entries[2]?.name || 'User'}
                      </p>
                      <p className="text-sm text-gray-500">{formatNumber(entries[2]?.points || 0)}</p>
                      <div className="mt-2 h-16 w-20 mx-auto bg-gray-200 dark:bg-gray-700 rounded-t-lg flex items-end justify-center">
                        <span className="text-2xl font-bold text-gray-500 mb-2">3</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Rest of the list */}
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {entries.slice(currentPage === 1 ? 3 : 0).map((entry, index) => {
                      const rank = currentPage === 1 ? index + 4 : index + 1;
                      const isCurrentUser = entry.userId === user?.id;
                      return (
                        <div
                          key={entry.id || entry.userId}
                          className={cn(
                            'flex items-center gap-4 p-4 transition-colors',
                            isCurrentUser
                              ? 'bg-primary-50 dark:bg-primary-900/20'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                          )}
                        >
                          <div className="w-12 text-center">{getRankIcon(rank + (currentPage - 1) * pageSize)}</div>
                          <Avatar
                            src={entry.avatar}
                            alt={entry.name}
                            className={cn('h-10 w-10', isCurrentUser && 'ring-2 ring-primary-500')}
                          />
                          <div className="flex-1 min-w-0">
                            <p className={cn('font-medium text-gray-900 dark:text-white truncate')}>
                              {entry.name || 'User'}
                              {isCurrentUser && (
                                <Badge variant="subtle" size="sm" className="ml-2">
                                  You
                                </Badge>
                              )}
                            </p>
                            <p className="text-sm text-gray-500">
                              {entry.quizzesCompleted || 0} quizzes &bull; {entry.avgScore || 0}% avg
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-primary-600">
                              {formatNumber(entry.points || 0)}
                            </p>
                            <p className="text-sm text-gray-500">points</p>
                          </div>
                          {entry.trend > 0 && (
                            <Badge variant="success" size="sm" icon={<TrendingUp className="h-3 w-3" />}>
                              +{entry.trend}
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Pagination */}
              <div className="mt-6 flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm text-gray-500">
                  Page {currentPage}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={entries.length < pageSize}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

// Avatar component
const Avatar = ({ src, alt, className }) => (
  <div
    className={cn('flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-600 font-semibold', className)}
  >
    {src ? (
      <img src={src} alt={alt} className="h-full w-full rounded-full object-cover" />
    ) : (
      <span className="text-sm">{alt?.[0]?.toUpperCase() || '?'}</span>
    )}
  </div>
);

export default Leaderboard;

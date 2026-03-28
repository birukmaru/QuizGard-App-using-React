import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, CardContent, Badge, Spinner } from '@/components/ui';
import { Footer } from '@/components/layout';
import { useAuth } from '@/hooks';
import { quizzesApi, categoriesApi } from '@/lib/api';
import { cn, formatNumber } from '@/lib/utils';
import {
  Play,
  Trophy,
  BookOpen,
  TrendingUp,
  Clock,
  Users,
  Star,
  ArrowRight,
  Zap,
  Target,
  Award,
  ChevronRight,
} from 'lucide-react';

const Home = () => {
  const { isSignedIn } = useAuth();
  const [featuredQuizzes, setFeaturedQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [quizzesData, categoriesData] = await Promise.all([
          quizzesApi.getFeatured().catch(() => []),
          categoriesApi.getAll().catch(() => []),
        ]);
        setFeaturedQuizzes(quizzesData.slice(0, 6));
        setCategories(categoriesData.slice(0, 8));
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const features = [
    {
      icon: Target,
      title: 'Track Progress',
      description: 'Monitor your quiz performance with detailed analytics and insights',
    },
    {
      icon: Trophy,
      title: 'Compete Globally',
      description: 'Join the leaderboard and compete with quiz enthusiasts worldwide',
    },
    {
      icon: BookOpen,
      title: 'Diverse Topics',
      description: 'Explore quizzes across science, history, technology, and more',
    },
    {
      icon: Zap,
      title: 'Timed Challenges',
      description: 'Test your knowledge under time pressure for extra excitement',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              Challenge Your Mind,
              <br />
              <span className="text-primary-200">Prove Your Knowledge</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-primary-100">
              Join thousands of quiz enthusiasts. Test your knowledge across various topics,
              track your progress, and climb the global leaderboard.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              {isSignedIn ? (
                <Link to="/dashboard">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="bg-white text-primary-700 hover:bg-primary-50"
                    rightIcon={<ArrowRight className="h-5 w-5" />}
                  >
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/sign-up">
                    <Button
                      size="lg"
                      className="bg-white text-primary-700 hover:bg-primary-50"
                      rightIcon={<ArrowRight className="h-5 w-5" />}
                    >
                      Start Quiz Free
                    </Button>
                  </Link>
                  <Link to="/categories">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white text-white hover:bg-white/10"
                    >
                      Browse Categories
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4">
              {[
                { label: 'Active Users', value: '50K+', icon: Users },
                { label: 'Quizzes Taken', value: '1M+', icon: BookOpen },
                { label: 'Questions', value: '100K+', icon: Target },
                { label: 'Categories', value: '25+', icon: TrendingUp },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <stat.icon className="mx-auto h-8 w-8 text-primary-200" />
                  <div className="mt-2 text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-primary-200">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="currentColor"
              className="text-gray-50 dark:text-gray-900"
            />
          </svg>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 sm:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Explore Categories
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Choose your favorite topics and start learning
              </p>
            </div>
            <Link to="/categories">
              <Button variant="ghost" rightIcon={<ChevronRight className="h-4 w-4" />}>
                View All
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {categories.map((category, index) => (
                <Link key={category.id} to={`/categories/${category.id}`}>
                  <Card
                    className={cn(
                      'h-full transition-all duration-200 hover:shadow-lg hover:-translate-y-1',
                      'cursor-pointer group'
                    )}
                  >
                    <CardContent className="p-6 text-center">
                      <div
                        className={cn(
                          'mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl',
                          'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400',
                          'group-hover:scale-110 transition-transform'
                        )}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        {category.icon ? (
                          <category.icon className="h-7 w-7" />
                        ) : (
                          <BookOpen className="h-7 w-7" />
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {category.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {category.quizCount || 0} quizzes
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Quizzes */}
      <section className="py-16 sm:py-24 bg-white dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Featured Quizzes
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Popular quizzes picked just for you
              </p>
            </div>
            <Link to="/categories">
              <Button variant="ghost" rightIcon={<ChevronRight className="h-4 w-4" />}>
                View All
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredQuizzes.map((quiz) => (
                <Link key={quiz.id} to={`/quiz/${quiz.id}`}>
                  <Card
                    className={cn(
                      'h-full transition-all duration-200 hover:shadow-lg hover:-translate-y-1',
                      'cursor-pointer group'
                    )}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <Badge variant="default">{quiz.category?.name || 'General'}</Badge>
                        {quiz.difficulty && (
                          <Badge
                            variant={
                              quiz.difficulty === 'easy'
                                ? 'success'
                                : quiz.difficulty === 'medium'
                                  ? 'warning'
                                  : 'danger'
                            }
                            size="sm"
                          >
                            {quiz.difficulty}
                          </Badge>
                        )}
                      </div>
                      <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white group-hover:text-primary-600">
                        {quiz.title}
                      </h3>
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {quiz.description}
                      </p>
                      <div className="mt-4 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          {quiz.questionCount || 0} questions
                        </span>
                        {quiz.timeLimit && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {quiz.timeLimit} min
                          </span>
                        )}
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-medium">{quiz.rating || 4.5}</span>
                        </div>
                        <Button
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          rightIcon={<Play className="h-4 w-4" />}
                        >
                          Play Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Why Choose QuizGard?
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Everything you need for an amazing quiz experience
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div key={feature.title} className="text-center">
                <div
                  className={cn(
                    'mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl',
                    'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                  )}
                >
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-primary-600">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to Test Your Knowledge?
          </h2>
          <p className="mt-4 text-lg text-primary-100">
            Join our community of learners and start your quiz journey today.
            It is free, fun, and rewarding!
          </p>
          <div className="mt-8">
            {isSignedIn ? (
              <Link to="/dashboard">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-primary-700 hover:bg-primary-50"
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                >
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/sign-up">
                <Button
                  size="lg"
                  className="bg-white text-primary-700 hover:bg-primary-50"
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                >
                  Get Started for Free
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;

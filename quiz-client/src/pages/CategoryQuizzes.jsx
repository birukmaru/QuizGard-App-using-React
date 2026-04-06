import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, Button, Badge, Spinner, Input, Select } from '@/components/ui';
import { categoriesApi, quizzesApi } from '@/lib/api';
import { cn, formatDate } from '@/lib/utils';
import {
  Search,
  Filter,
  Play,
  Clock,
  Target,
  Star,
  Trophy,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

const CategoryQuizzes = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [difficultyFilter, setDifficultyFilter] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const categoryData = await categoriesApi.getById(categoryId).catch(() => null);
        const quizzesData = await quizzesApi.getByCategory(categoryId, { sort: sortBy }).catch(() => []);
        setCategory(categoryData);
        setQuizzes(Array.isArray(quizzesData) ? quizzesData : []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setQuizzes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryId, sortBy]);

  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = !difficultyFilter || quiz.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  const difficultyOptions = [
    { value: '', label: 'All Difficulties' },
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' },
  ];

  const sortOptions = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'recent', label: 'Most Recent' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'questions', label: 'Most Questions' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <section className="bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
            <Link to="/categories" className="hover:text-primary-600">
              Categories
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900 dark:text-white">{category?.name || 'Loading...'}</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {category?.name || 'Category'}
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {category?.description || `${quizzes.length} quizzes available`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default" size="lg" icon={<BookOpen className="h-4 w-4" />}>
                {quizzes.length} Quizzes
              </Badge>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search quizzes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="h-5 w-5" />}
              />
            </div>
            <Select
              options={difficultyOptions}
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              containerClassName="w-full sm:w-48"
            />
            <Select
              options={sortOptions}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              containerClassName="w-full sm:w-48"
            />
          </div>
        </div>
      </section>

      {/* Quizzes Grid */}
      <section className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-16">
              <Spinner size="lg" label="Loading quizzes..." />
            </div>
          ) : filteredQuizzes.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
              <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
                {searchQuery || difficultyFilter
                  ? 'No quizzes match your filters'
                  : 'No quizzes available in this category yet'}
              </p>
              {(searchQuery || difficultyFilter) && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery('');
                    setDifficultyFilter('');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredQuizzes.map((quiz) => (
                <QuizCard key={quiz.id} quiz={quiz} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

const QuizCard = ({ quiz }) => {
  return (
    <Link to={`/quiz/${quiz.id}`}>
      <Card
        className={cn(
          'h-full transition-all duration-200 hover:shadow-lg hover:-translate-y-1',
          'cursor-pointer group'
        )}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex gap-2">
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
            {quiz.isFeatured && (
              <Badge variant="warning" size="sm" icon={<Star className="h-3 w-3" />}>
                Featured
              </Badge>
            )}
          </div>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-primary-600">
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
              <span className="text-sm text-gray-400">({quiz.attemptsCount || 0})</span>
            </div>
            <Button
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              rightIcon={<Play className="h-4 w-4" />}
            >
              Play
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default CategoryQuizzes;

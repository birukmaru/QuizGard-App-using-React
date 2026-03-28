import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui';
import { attemptsApi } from '@/lib/api';
import { cn, getGrade, formatDate } from '@/lib/utils';
import {
  Trophy,
  Medal,
  Award,
  Home,
  RotateCcw,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  TrendingUp,
  Share2,
  BarChart3,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const QuizResult = () => {
  const { attemptId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState(location.state?.result || null);
  const [quiz, setQuiz] = useState(location.state?.quiz || null);
  const [questions, setQuestions] = useState(location.state?.questions || []);
  const [answers, setAnswers] = useState(location.state?.answers || {});
  const [loading, setLoading] = useState(!result);

  useEffect(() => {
    const fetchResult = async () => {
      if (!result && attemptId) {
        try {
          const data = await attemptsApi.getAttemptById(attemptId);
          setResult(data);
          setQuiz(data.quiz);
          setQuestions(data.quiz?.questions || []);
          setAnswers(data.answers || {});
        } catch (error) {
          console.error('Failed to fetch result:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchResult();
  }, [attemptId, result]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
          <p className="mt-4 text-gray-500">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="max-w-md text-center p-8">
          <XCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
            Result not found
          </h2>
          <p className="mt-2 text-gray-500">We could not find the quiz result you are looking for.</p>
          <Link to="/categories">
            <Button className="mt-6">Browse Categories</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const grade = getGrade(result.percentage || 0);
  const isPassed = (result.percentage || 0) >= 60;

  // Calculate chart data
  const chartData = questions.map((q, idx) => {
    const userAnswer = answers[q.id];
    const isCorrect = userAnswer === q.correctAnswer;
    return {
      question: `Q${idx + 1}`,
      score: isCorrect ? 1 : 0,
      isCorrect,
    };
  });

  const handleShare = async () => {
    const text = `I scored ${result.percentage}% on "${quiz?.title}" quiz! Can you beat my score?`;
    if (navigator.share) {
      await navigator.share({ title: 'Quiz Result', text });
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header Card */}
        <Card className="overflow-hidden">
          <div
            className={cn(
              'px-8 py-12 text-center',
              isPassed
                ? 'bg-gradient-to-br from-success-500 to-success-600'
                : 'bg-gradient-to-br from-warning-500 to-warning-600'
            )}
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/20">
              {result.percentage >= 80 ? (
                <Trophy className="h-10 w-10 text-white" />
              ) : result.percentage >= 60 ? (
                <Medal className="h-10 w-10 text-white" />
              ) : (
                <Award className="h-10 w-10 text-white" />
              )}
            </div>
            <h1 className="mt-4 text-4xl font-bold text-white">
              {grade.letter} Grade
            </h1>
            <p className="mt-2 text-xl text-white/90">{grade.label}!</p>
          </div>

          <CardContent className="p-8">
            <div className="text-center">
              <span className={cn('text-7xl font-bold', grade.color)}>
                {result.percentage || 0}%
              </span>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                {result.correctAnswers || 0} out of {result.totalQuestions || questions.length} correct
              </p>
            </div>

            {/* Stats Grid */}
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success-100 mx-auto dark:bg-success-900/30">
                  <CheckCircle className="h-6 w-6 text-success-600" />
                </div>
                <p className="mt-2 text-2xl font-bold text-success-600">
                  {result.correctAnswers || 0}
                </p>
                <p className="text-sm text-gray-500">Correct</p>
              </div>
              <div className="text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-danger-100 mx-auto dark:bg-danger-900/30">
                  <XCircle className="h-6 w-6 text-danger-600" />
                </div>
                <p className="mt-2 text-2xl font-bold text-danger-600">
                  {(result.totalQuestions || questions.length) - (result.correctAnswers || 0)}
                </p>
                <p className="text-sm text-gray-500">Incorrect</p>
              </div>
              <div className="text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 mx-auto dark:bg-primary-900/30">
                  <Clock className="h-6 w-6 text-primary-600" />
                </div>
                <p className="mt-2 text-2xl font-bold text-primary-600">
                  {result.timeTaken ? `${Math.floor(result.timeTaken / 60)}m` : '--'}
                </p>
                <p className="text-sm text-gray-500">Time Taken</p>
              </div>
              <div className="text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100 mx-auto dark:bg-yellow-900/30">
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                </div>
                <p className="mt-2 text-2xl font-bold text-yellow-600">
                  #{result.rank || '--'}
                </p>
                <p className="text-sm text-gray-500">Leaderboard</p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button variant="outline" className="flex-1" onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                Share Result
              </Button>
              <Link to={`/quiz/${quiz?.id}`} className="flex-1">
                <Button variant="outline" className="w-full">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              </Link>
              <Link to="/categories" className="flex-1">
                <Button className="w-full">
                  <Home className="mr-2 h-4 w-4" />
                  Browse More
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Question Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis dataKey="question" />
                  <YAxis domain={[0, 1]} ticks={[0, 1]} />
                  <Tooltip
                    formatter={(value, name, props) => [
                      props.payload.isCorrect ? 'Correct' : 'Incorrect',
                      'Result',
                    ]}
                  />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.isCorrect ? '#22c55e' : '#ef4444'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Question Review */}
        <Card>
          <CardHeader>
            <CardTitle>Question Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {questions.map((q, idx) => {
              const userAnswer = answers[q.id];
              const isCorrect = userAnswer === q.correctAnswer;
              return (
                <div
                  key={q.id}
                  className={cn(
                    'rounded-lg border p-4',
                    isCorrect
                      ? 'border-success-200 bg-success-50 dark:border-success-800 dark:bg-success-900/20'
                      : 'border-danger-200 bg-danger-50 dark:border-danger-800 dark:bg-danger-900/20'
                  )}
                >
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 flex-shrink-0 text-success-600 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 flex-shrink-0 text-danger-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        <span className="text-gray-500">Q{idx + 1}.</span> {q.question}
                      </p>
                      <div className="mt-3 space-y-2">
                        {q.options?.map((option, optIdx) => {
                          const isUserAnswer = userAnswer === optIdx;
                          const isCorrectAnswer = q.correctAnswer === optIdx;
                          return (
                            <div
                              key={optIdx}
                              className={cn(
                                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm',
                                isCorrectAnswer && 'bg-success-100 dark:bg-success-900/30',
                                isUserAnswer && !isCorrectAnswer && 'bg-danger-100 dark:bg-danger-900/30'
                              )}
                            >
                              <span className="font-medium">
                                {String.fromCharCode(65 + optIdx)}.
                              </span>
                              <span className="flex-1">{option}</span>
                              {isCorrectAnswer && (
                                <Badge variant="success" size="sm">Correct</Badge>
                              )}
                              {isUserAnswer && !isCorrectAnswer && (
                                <Badge variant="danger" size="sm">Your answer</Badge>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuizResult;

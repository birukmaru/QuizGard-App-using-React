import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, Button, Badge, Spinner, Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui';
import { useQuizTaking } from '@/hooks';
import { cn, getGrade } from '@/lib/utils';
import {
  Play,
  Clock,
  Target,
  ChevronLeft,
  ChevronRight,
  Pause,
  CheckCircle,
  XCircle,
  ArrowRight,
  Home,
  RotateCcw,
  Trophy,
  Medal,
  Award,
} from 'lucide-react';

const QuizPlay = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const {
    quiz,
    questions,
    currentQuestion,
    currentQuestionIndex,
    answers,
    timeRemaining,
    isSubmitting,
    result,
    loading,
    error,
    progress,
    selectAnswer,
    nextQuestion,
    prevQuestion,
    goToQuestion,
    startTimer,
    submitQuiz,
    resetQuiz,
    fetchQuestions,
  } = useQuizTaking(quizId);

  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  // Start timer when quiz begins
  useEffect(() => {
    if (quizStarted && quiz?.timeLimit && !result) {
      startTimer(quiz.timeLimit * 60); // Convert minutes to seconds
    }
  }, [quizStarted, quiz?.timeLimit, result, startTimer]);

  // Redirect to result page after successful submission
  useEffect(() => {
    if (result && !isSubmitting) {
      navigate(`/result/${result.id || 'new'}`, { state: { result, quiz, questions, answers } });
    }
  }, [result, isSubmitting, navigate, quiz, questions, answers]);

  const handleStartQuiz = () => {
    setQuizStarted(true);
  };

  const handlePause = () => {
    setShowPauseModal(true);
  };

  const handleResume = () => {
    setShowPauseModal(false);
  };

  const handleQuit = () => {
    navigate('/categories');
  };

  const handleSubmit = async () => {
    setShowConfirmSubmit(false);
    await submitQuiz();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Pre-quiz screen
  if (!quizStarted) {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <Spinner size="lg" label="Loading quiz..." />
        </div>
      );
    }

    if (error || !quiz) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <Card className="max-w-md text-center p-8">
            <XCircle className="mx-auto h-12 w-12 text-danger-500" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
              Failed to load quiz
            </h2>
            <p className="mt-2 text-gray-500">{error || 'Quiz not found'}</p>
            <Link to="/categories">
              <Button className="mt-6">Browse Categories</Button>
            </Link>
          </Card>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-800 px-4">
        <Card className="max-w-lg w-full">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-100 dark:bg-primary-900/30">
              <Trophy className="h-10 w-10 text-primary-600" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{quiz.title}</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">{quiz.description}</p>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                <Target className="mx-auto h-6 w-6 text-primary-600" />
                <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                  {questions.length}
                </p>
                <p className="text-sm text-gray-500">Questions</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                <Clock className="mx-auto h-6 w-6 text-primary-600" />
                <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                  {quiz.timeLimit || 'No'} {quiz.timeLimit ? 'min' : ''}
                </p>
                <p className="text-sm text-gray-500">Time Limit</p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-4">
              {quiz.difficulty && (
                <Badge
                  variant={
                    quiz.difficulty === 'easy'
                      ? 'success'
                      : quiz.difficulty === 'medium'
                        ? 'warning'
                        : 'danger'
                  }
                  size="lg"
                >
                  {quiz.difficulty}
                </Badge>
              )}
              {quiz.category && <Badge variant="default">{quiz.category.name}</Badge>}
            </div>

            <div className="mt-8">
              <Button size="lg" className="w-full" onClick={handleStartQuiz}>
                <Play className="mr-2 h-5 w-5" />
                Start Quiz
              </Button>
              <Link to="/categories">
                <Button variant="ghost" className="mt-3 w-full">
                  Go Back
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Result screen
  if (result) {
    const grade = getGrade(result.percentage || 0);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <Card className="max-w-lg w-full">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
              {result.percentage >= 80 ? (
                <Trophy className="h-12 w-12 text-yellow-500" />
              ) : result.percentage >= 60 ? (
                <Medal className="h-12 w-12 text-gray-500" />
              ) : (
                <Award className="h-12 w-12 text-orange-500" />
              )}
            </div>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {grade.label}!
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">You scored</p>

            <div className="mt-4">
              <span className={cn('text-6xl font-bold', grade.color)}>
                {result.percentage || 0}%
              </span>
            </div>

            <p className="mt-2 text-lg text-gray-500">
              {result.correctAnswers || 0} out of {result.totalQuestions || questions.length} correct
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-success-50 p-4 dark:bg-success-900/20">
                <CheckCircle className="mx-auto h-6 w-6 text-success-600" />
                <p className="mt-1 text-xl font-bold text-success-600">
                  {result.correctAnswers || 0}
                </p>
                <p className="text-sm text-success-600/80">Correct</p>
              </div>
              <div className="rounded-lg bg-danger-50 p-4 dark:bg-danger-900/20">
                <XCircle className="mx-auto h-6 w-6 text-danger-600" />
                <p className="mt-1 text-xl font-bold text-danger-600">
                  {(result.totalQuestions || questions.length) - (result.correctAnswers || 0)}
                </p>
                <p className="text-sm text-danger-600/80">Incorrect</p>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={resetQuiz}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Link to="/categories" className="flex-1">
                <Button className="w-full">
                  <Home className="mr-2 h-4 w-4" />
                  Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Quiz in progress
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Bar */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-semibold text-gray-900 dark:text-white">{quiz?.title}</h1>
              <p className="text-sm text-gray-500">
                Question {progress.current} of {progress.total}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Timer */}
              {timeRemaining !== null && (
                <div
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-4 py-2 font-mono text-lg font-bold',
                    timeRemaining <= 60
                      ? 'bg-danger-100 text-danger-600'
                      : 'bg-gray-100 dark:bg-gray-700'
                  )}
                >
                  <Clock className="h-5 w-5" />
                  {formatTime(timeRemaining)}
                </div>
              )}

              <Button variant="ghost" size="sm" onClick={handlePause}>
                <Pause className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 h-2 rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full rounded-full bg-primary-600 transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>
      </header>

      {/* Question Navigation Pills */}
      <div className="border-b border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700">
        <div className="mx-auto max-w-4xl px-4 py-3">
          <div className="flex flex-wrap gap-2">
            {questions.map((q, idx) => {
              const isAnswered = !!answers[q.id];
              const isCurrent = idx === currentQuestionIndex;
              return (
                <button
                  key={q.id}
                  onClick={() => goToQuestion(idx)}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors',
                    isCurrent
                      ? 'bg-primary-600 text-white'
                      : isAnswered
                        ? 'bg-success-100 text-success-600 dark:bg-success-900/30'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  )}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Question Content */}
      <main className="mx-auto max-w-4xl px-4 py-8">
        <Card>
          <CardContent className="p-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {currentQuestion?.question}
            </h2>

            {/* Options */}
            <div className="mt-6 space-y-3">
              {currentQuestion?.options?.map((option, idx) => {
                const isSelected = answers[currentQuestion?.id] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => selectAnswer(idx)}
                    className={cn(
                      'flex w-full items-center gap-4 rounded-lg border-2 p-4 text-left transition-all',
                      isSelected
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium',
                        isSelected
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700'
                      )}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1 text-gray-900 dark:text-white">{option}</span>
                    {isSelected && <CheckCircle className="h-5 w-5 text-primary-500" />}
                  </button>
                );
              })}
            </div>

            {/* Navigation */}
            <div className="mt-8 flex items-center justify-between">
              <Button
                variant="outline"
                onClick={prevQuestion}
                disabled={currentQuestionIndex === 0}
                leftIcon={<ChevronLeft className="h-4 w-4" />}
              >
                Previous
              </Button>

              {currentQuestionIndex === questions.length - 1 ? (
                <Button
                  onClick={() => setShowConfirmSubmit(true)}
                  disabled={Object.keys(answers).length < questions.length}
                >
                  Submit Quiz
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={nextQuestion} rightIcon={<ChevronRight className="h-4 w-4" />}>
                  Next
                </Button>
              )}
            </div>

            {/* Answered count */}
            <p className="mt-4 text-center text-sm text-gray-500">
              {progress.answered} of {progress.total} questions answered
            </p>
          </CardContent>
        </Card>
      </main>

      {/* Pause Modal */}
      <Modal open={showPauseModal} onClose={handleResume}>
        <ModalHeader>
          <ModalTitle>Quiz Paused</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <p className="text-gray-600 dark:text-gray-400">
            Take a break! Your progress has been saved. When you are ready, click Resume to continue.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-4 text-center">
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {progress.answered}
              </p>
              <p className="text-sm text-gray-500">Answered</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {progress.total - progress.answered}
              </p>
              <p className="text-sm text-gray-500">Remaining</p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={handleQuit}>
            Quit Quiz
          </Button>
          <Button onClick={handleResume}>
            <Play className="mr-2 h-4 w-4" />
            Resume
          </Button>
        </ModalFooter>
      </Modal>

      {/* Confirm Submit Modal */}
      <Modal open={showConfirmSubmit} onClose={() => setShowConfirmSubmit(false)}>
        <ModalHeader>
          <ModalTitle>Submit Quiz?</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to submit your answers? You have answered{' '}
            <strong>{progress.answered}</strong> out of <strong>{progress.total}</strong> questions.
          </p>
          {progress.answered < progress.total && (
            <p className="mt-2 text-warning-600 dark:text-warning-400">
              Warning: You have {progress.total - progress.answered} unanswered questions.
            </p>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowConfirmSubmit(false)}>
            Keep Answering
          </Button>
          <Button onClick={handleSubmit} isLoading={isSubmitting}>
            Submit Quiz
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default QuizPlay;

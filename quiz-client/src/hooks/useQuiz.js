import { useState, useCallback, useEffect, useMemo } from 'react';
import { quizzesApi, questionsApi, attemptsApi } from '@/lib/api';
import { shuffleArray } from '@/lib/utils';

/**
 * Hook for managing quiz-related state and operations
 */
export function useQuiz(quizId) {
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch quiz data
  const fetchQuiz = useCallback(async () => {
    if (!quizId) return;

    try {
      setLoading(true);
      setError(null);
      const quizData = await quizzesApi.getById(quizId);
      setQuiz(quizData);
      return quizData;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  // Fetch quiz questions
  const fetchQuestions = useCallback(async () => {
    if (!quizId) return;

    try {
      setLoading(true);
      setError(null);
      const questionsData = await questionsApi.getByQuiz(quizId);
      setQuestions(questionsData);
      return questionsData;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  // Fetch both quiz and questions
  const fetchQuizWithQuestions = useCallback(async () => {
    const [quizData, questionsData] = await Promise.all([
      fetchQuiz(),
      fetchQuestions(),
    ]);
    return { quiz: quizData, questions: questionsData };
  }, [fetchQuiz, fetchQuestions]);

  // Fetch quiz on mount if quizId changes
  useEffect(() => {
    if (quizId) {
      fetchQuizWithQuestions();
    }
  }, [quizId, fetchQuizWithQuestions]);

  return {
    quiz,
    questions,
    loading,
    error,
    fetchQuiz,
    fetchQuestions,
    fetchQuizWithQuestions,
    setQuiz,
    setQuestions,
    clearError: () => setError(null),
  };
}

/**
 * Hook for managing quiz-taking state
 */
export function useQuizTaking(quizId) {
  const { questions, loading, error, fetchQuestions } = useQuiz(quizId);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  // Shuffled questions for this session
  const shuffledQuestions = useMemo(() => {
    return shuffleArray(questions);
  }, [questions]);

  // Current question
  const currentQuestion = shuffledQuestions[currentQuestionIndex];

  // Progress
  const progress = {
    current: currentQuestionIndex + 1,
    total: shuffledQuestions.length,
    percentage: Math.round(((currentQuestionIndex + 1) / shuffledQuestions.length) * 100),
    answered: Object.keys(answers).length,
  };

  // Select answer for current question
  const selectAnswer = useCallback((answerId) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion?.id]: answerId,
    }));
  }, [currentQuestion]);

  // Go to next question
  const nextQuestion = useCallback(() => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  }, [currentQuestionIndex, shuffledQuestions.length]);

  // Go to previous question
  const prevQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  }, [currentQuestionIndex]);

  // Jump to specific question
  const goToQuestion = useCallback((index) => {
    if (index >= 0 && index < shuffledQuestions.length) {
      setCurrentQuestionIndex(index);
    }
  }, [shuffledQuestions.length]);

  // Timer functionality
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto-submit when time runs out
          submitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  // Start timer
  const startTimer = useCallback((seconds) => {
    setTimeRemaining(seconds);
  }, []);

  // Stop timer
  const stopTimer = useCallback(() => {
    setTimeRemaining(null);
  }, []);

  // Submit quiz
  const submitQuiz = useCallback(async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const submissionData = {
        answers,
        timeTaken: quiz?.timeLimit ? quiz.timeLimit - timeRemaining : null,
        completedAt: new Date().toISOString(),
      };

      const resultData = await attemptsApi.submit(quizId, submissionData);
      setResult(resultData);
      return resultData;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [quizId, answers, quiz, timeRemaining, isSubmitting]);

  // Reset quiz state
  const resetQuiz = useCallback(() => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTimeRemaining(null);
    setResult(null);
    setError(null);
  }, []);

  // Calculate score without submitting
  const calculateScore = useCallback(() => {
    let correct = 0;
    questions.forEach((question) => {
      if (answers[question.id] === question.correctAnswer) {
        correct++;
      }
    });
    return {
      correct,
      total: questions.length,
      percentage: Math.round((correct / questions.length) * 100),
    };
  }, [questions, answers]);

  return {
    // State
    quiz,
    questions: shuffledQuestions,
    currentQuestion,
    currentQuestionIndex,
    answers,
    timeRemaining,
    isSubmitting,
    result,
    loading,
    error,

    // Progress
    progress,

    // Actions
    selectAnswer,
    nextQuestion,
    prevQuestion,
    goToQuestion,
    startTimer,
    stopTimer,
    submitQuiz,
    resetQuiz,
    calculateScore,
    fetchQuestions,
  };
}

export default useQuiz;

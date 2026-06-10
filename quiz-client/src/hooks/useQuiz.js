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

  // Fetch quiz data (includes questions)
  const fetchQuiz = useCallback(async () => {
    if (!quizId) return;

    try {
      setLoading(true);
      setError(null);
      const quizData = await quizzesApi.getById(quizId);
      const quizContent = quizData?.data || quizData;
      setQuiz(quizContent);
      
      // Extract questions from quiz data
      if (quizContent?.questions) {
        setQuestions(quizContent.questions);
      }
      return quizData;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  // Fetch quiz questions (deprecated - now included in quiz data)
  const fetchQuestions = useCallback(async () => {
    if (!quizId) return;

    try {
      setLoading(true);
      setError(null);
      // Questions are already fetched with the quiz, so just return from state
      return questions;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [quizId, questions]);

  // Fetch both quiz and questions (now just fetches quiz which includes questions)
  const fetchQuizWithQuestions = useCallback(async () => {
    return await fetchQuiz();
  }, [fetchQuiz]);

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
  const { quiz, questions, loading, error: initialError, fetchQuestions } = useQuiz(quizId);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(initialError);

  // Shuffled questions for this session
  const shuffledQuestions = useMemo(() => {
    if (!Array.isArray(questions)) return [];
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
  const selectAnswer = useCallback((optionId) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion?.id]: optionId,
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
        quizId,
        answers: Object.entries(answers).map(([questionId, selectedOptionId]) => ({
          questionId,
          selectedOptionId,
        })),
        timeSpent: quiz?.timeLimit ? quiz.timeLimit * 60 - timeRemaining : null,
      };

      const resultData = await attemptsApi.submit(quizId, submissionData);
      setResult(resultData?.data || resultData);
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

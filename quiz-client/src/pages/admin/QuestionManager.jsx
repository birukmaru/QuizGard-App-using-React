import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  Button,
  Badge,
  Spinner,
  Input,
  Modal,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
  Select,
} from '@/components/ui';
import { questionsApi, quizzesApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import {
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  GripVertical,
  Target,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

const QuestionManager = () => {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [formData, setFormData] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [quizId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [quizData, questionsData] = await Promise.all([
        quizzesApi.getById(quizId),
        questionsApi.getByQuiz(quizId),
      ]);
      setQuiz(quizData);
      setQuestions(questionsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      setSaving(true);
      await questionsApi.create(quizId, formData);
      await fetchData();
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create question:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedQuestion) return;
    try {
      setSaving(true);
      await questionsApi.update(selectedQuestion.id, formData);
      await fetchData();
      setShowEditModal(false);
      setSelectedQuestion(null);
      resetForm();
    } catch (error) {
      console.error('Failed to update question:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (questionId) => {
    try {
      setSaving(true);
      await questionsApi.delete(questionId);
      await fetchData();
    } catch (error) {
      console.error('Failed to delete question:', error);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
    });
  };

  const openEditModal = (question) => {
    setSelectedQuestion(question);
    setFormData({
      question: question.question,
      options: question.options || ['', '', '', ''],
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || '',
    });
    setShowEditModal(true);
  };

  const updateOption = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Spinner size="lg" label="Loading..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-2">
            <Link
              to="/admin/quizzes"
              className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {quiz?.title || 'Quiz'} - Questions
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {questions.length} question{questions.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="flex justify-end mb-6">
          <Button onClick={() => setShowCreateModal(true)} leftIcon={<Plus className="h-4 w-4" />}>
            Add Question
          </Button>
        </div>

        {questions.length === 0 ? (
          <Card className="text-center py-16">
            <Target className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              No questions yet
            </h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Add questions to make your quiz playable
            </p>
            <Button className="mt-6" onClick={() => setShowCreateModal(true)}>
              Add Question
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {questions.map((question, index) => (
              <Card key={question.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600 font-medium dark:bg-gray-700 dark:text-gray-300">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {question.question}
                      </p>
                      <div className="mt-3 space-y-2">
                        {question.options?.map((option, optIdx) => (
                          <div
                            key={optIdx}
                            className={cn(
                              'flex items-center gap-2 rounded-lg px-3 py-2 text-sm',
                              question.correctAnswer === optIdx
                                ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400'
                                : 'bg-gray-50 dark:bg-gray-800'
                            )}
                          >
                            <span className="font-medium">
                              {String.fromCharCode(65 + optIdx)}.
                            </span>
                            <span className="flex-1">{option}</span>
                            {question.correctAnswer === optIdx && (
                              <Badge variant="success" size="sm">Correct</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                      {question.explanation && (
                        <p className="mt-3 text-sm text-gray-500 italic">
                          Explanation: {question.explanation}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditModal(question)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(question.id)}
                      >
                        <Trash2 className="h-4 w-4 text-danger-600" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Create Modal */}
      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <ModalHeader>
          <ModalTitle>Add Question</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Question <span className="text-danger">*</span>
              </label>
              <textarea
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                placeholder="Enter your question"
                className="flex w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
                rows={2}
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Options <span className="text-danger">*</span>
              </label>
              {formData.options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-sm font-medium dark:bg-gray-700">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <Input
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                    className="flex-1"
                  />
                  <Button
                    variant={formData.correctAnswer === index ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFormData({ ...formData, correctAnswer: index })}
                  >
                    {formData.correctAnswer === index ? 'Correct' : 'Set'}
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Explanation (optional)
              </label>
              <textarea
                value={formData.explanation}
                onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                placeholder="Explain the correct answer"
                className="flex w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
                rows={2}
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            isLoading={saving}
            disabled={!formData.question || formData.options.some((o) => !o.trim())}
          >
            Add Question
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit Modal */}
      <Modal open={showEditModal} onClose={() => setShowEditModal(false)}>
        <ModalHeader>
          <ModalTitle>Edit Question</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Question <span className="text-danger">*</span>
              </label>
              <textarea
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                placeholder="Enter your question"
                className="flex w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
                rows={2}
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Options <span className="text-danger">*</span>
              </label>
              {formData.options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-sm font-medium dark:bg-gray-700">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <Input
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                    className="flex-1"
                  />
                  <Button
                    variant={formData.correctAnswer === index ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFormData({ ...formData, correctAnswer: index })}
                  >
                    {formData.correctAnswer === index ? 'Correct' : 'Set'}
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Explanation (optional)
              </label>
              <textarea
                value={formData.explanation}
                onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                placeholder="Explain the correct answer"
                className="flex w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
                rows={2}
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleEdit}
            isLoading={saving}
            disabled={!formData.question || formData.options.some((o) => !o.trim())}
          >
            Save Changes
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default QuestionManager;

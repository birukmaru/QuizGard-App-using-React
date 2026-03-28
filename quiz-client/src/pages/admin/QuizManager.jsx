import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  Button,
  Badge,
  Spinner,
  Input,
  Select,
  Modal,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
  ConfirmModal,
  DifficultyBadge,
} from '@/components/ui';
import { quizzesApi, categoriesApi } from '@/lib/api';
import { cn, formatDate } from '@/lib/utils';
import {
  Plus,
  Edit,
  Trash2,
  BookOpen,
  Search,
  ChevronRight,
  Eye,
  Clock,
  Target,
} from 'lucide-react';

const QuizManager = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    difficulty: 'medium',
    timeLimit: 10,
    isPublished: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [quizzesData, categoriesData] = await Promise.all([
        quizzesApi.getAll({ sort: 'recent' }),
        categoriesApi.getAll(),
      ]);
      setQuizzes(quizzesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      setSaving(true);
      await quizzesApi.create(formData);
      await fetchData();
      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        categoryId: '',
        difficulty: 'medium',
        timeLimit: 10,
        isPublished: false,
      });
    } catch (error) {
      console.error('Failed to create quiz:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedQuiz) return;
    try {
      setSaving(true);
      await quizzesApi.delete(selectedQuiz.id);
      await fetchData();
      setShowDeleteConfirm(false);
      setSelectedQuiz(null);
    } catch (error) {
      console.error('Failed to delete quiz:', error);
    } finally {
      setSaving(false);
    }
  };

  const openDeleteConfirm = (quiz) => {
    setSelectedQuiz(quiz);
    setShowDeleteConfirm(true);
  };

  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || quiz.categoryId === categoryFilter;
    const matchesStatus = !statusFilter || quiz.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Draft' },
    { value: 'archived', label: 'Archived' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quiz Manager</h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">Manage quiz content</p>
            </div>
            <Button onClick={() => setShowCreateModal(true)} leftIcon={<Plus className="h-4 w-4" />}>
              Create Quiz
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Input
            placeholder="Search quizzes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="h-5 w-5" />}
          />
          <Select
            options={categoryOptions}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          />
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>

        {/* Quizzes Grid */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" label="Loading quizzes..." />
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <Card className="text-center py-16">
            <BookOpen className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              {searchQuery || categoryFilter || statusFilter
                ? 'No quizzes found'
                : 'No quizzes yet'}
            </h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              {searchQuery || categoryFilter || statusFilter
                ? 'Try adjusting your filters'
                : 'Create your first quiz to get started'}
            </p>
            {!searchQuery && !categoryFilter && !statusFilter && (
              <Button className="mt-6" onClick={() => setShowCreateModal(true)}>
                Create Quiz
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredQuizzes.map((quiz) => (
              <Card key={quiz.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <Badge variant="default">{quiz.category?.name || 'Uncategorized'}</Badge>
                    <DifficultyBadge difficulty={quiz.difficulty} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {quiz.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                    {quiz.description || 'No description'}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      {quiz.questionCount || 0} Q
                    </span>
                    {quiz.timeLimit && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {quiz.timeLimit}m
                      </span>
                    )}
                    <span>{formatDate(quiz.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/admin/quizzes/${quiz.id}/questions`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </Link>
                    <Link to={`/quiz/${quiz.id}`} className="flex-1">
                      <Button variant="ghost" size="sm" className="w-full">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDeleteConfirm(quiz)}
                    >
                      <Trash2 className="h-4 w-4 text-danger-600" />
                    </Button>
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
          <ModalTitle>Create Quiz</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter quiz title"
              required
            />
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter quiz description"
                className="flex w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
                rows={3}
              />
            </div>
            <Select
              label="Category"
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              placeholder="Select category"
            />
            <Select
              label="Difficulty"
              options={[
                { value: 'easy', label: 'Easy' },
                { value: 'medium', label: 'Medium' },
                { value: 'hard', label: 'Hard' },
              ]}
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
            />
            <Input
              label="Time Limit (minutes)"
              type="number"
              value={formData.timeLimit}
              onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) })}
              min={1}
              max={120}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} isLoading={saving} disabled={!formData.title}>
            Create
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Quiz"
        description={`Are you sure you want to delete "${selectedQuiz?.title}"? This will also delete all associated questions.`}
        confirmText="Delete"
        variant="destructive"
        isLoading={saving}
      />
    </div>
  );
};

export default QuizManager;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, Button, Badge, Spinner, Input } from '@/components/ui';
import { Sidebar, SidebarProvider, useSidebar } from '@/components/layout';
import { categoriesApi } from '@/lib/api';
import { useAuth } from '@/hooks';
import { cn } from '@/lib/utils';
import {
  Search,
  BookOpen,
  Trophy,
  Zap,
  Code,
  History,
  FlaskConical,
  Globe,
  Music,
  Palette,
  Heart,
  Briefcase,
  Brain,
  ChevronRight,
} from 'lucide-react';

const iconMap = {
  BookOpen,
  Trophy,
  Zap,
  Code,
  History,
  FlaskConical,
  Globe,
  Music,
  Palette,
  Heart,
  Briefcase,
  Brain,
};

const CategoriesContent = ({ hasSidebar = false }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const { collapsed } = hasSidebar ? useSidebar() : { collapsed: false };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await categoriesApi.getAll();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group categories by first letter for better UX
  const groupedCategories = filteredCategories.reduce((acc, category) => {
    const firstLetter = category.name[0].toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(category);
    return acc;
  }, {});

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <section className="bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Quiz Categories
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Explore our wide range of quiz categories and find your favorite topics
            </p>
          </div>

          {/* Search */}
          <div className="mt-8 max-w-xl mx-auto">
            <Input
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="h-5 w-5" />}
              containerClassName="w-full"
            />
          </div>

          {/* Stats */}
          <div className="mt-8 flex justify-center gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">{categories.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">
                {categories.reduce((sum, cat) => sum + (cat.quizCount || 0), 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Quizzes</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="flex-1 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-16">
              <Spinner size="lg" label="Loading categories..." />
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-danger-600 dark:text-danger-400">Failed to load categories</p>
              <p className="mt-2 text-gray-500">{error}</p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-16">
              <Search className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
              <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
                No categories found matching "{searchQuery}"
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </Button>
            </div>
          ) : (
            <>
              {Object.keys(groupedCategories).length === 1 ? (
                // Single group - show as simple grid
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredCategories.map((category) => (
                    <CategoryCard key={category.id} category={category} />
                  ))}
                </div>
              ) : (
                // Multiple groups - show with headers
                <div className="space-y-12">
                  {Object.entries(groupedCategories)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([letter, items]) => (
                      <div key={letter}>
                        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                          {letter}
                        </h2>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                          {items.map((category) => (
                            <CategoryCard key={category.id} category={category} />
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

const CategoryCard = ({ category }) => {
  const IconComponent = iconMap[category.icon] || BookOpen;

  return (
    <Link to={`/categories/${category.id}`}>
      <Card
        className={cn(
          'h-full transition-all duration-200 hover:shadow-lg hover:-translate-y-1',
          'cursor-pointer group'
        )}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div
              className={cn(
                'flex h-14 w-14 items-center justify-center rounded-xl transition-transform',
                'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400',
                'group-hover:scale-110'
              )}
            >
              <IconComponent className="h-7 w-7" />
            </div>
            {category.quizCount && (
              <Badge variant="subtle" size="sm">
                {category.quizCount} quizzes
              </Badge>
            )}
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600">
            {category.name}
          </h3>
          {category.description && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {category.description}
            </p>
          )}
          <div className="mt-4 flex items-center text-sm text-primary-600 dark:text-primary-400">
            <span>Explore</span>
            <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

const Categories = () => {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return (
      <SidebarProvider>
        <CategoriesWithSidebar />
      </SidebarProvider>
    );
  }

  return <CategoriesContent />;
};

const CategoriesWithSidebar = () => {
  const { collapsed } = useSidebar();
  return (
    <div className="flex">
      <Sidebar />
      <div className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'}`}>
        <CategoriesContent hasSidebar />
      </div>
    </div>
  );
};

export default Categories;

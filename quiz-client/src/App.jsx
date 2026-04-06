import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';

// Layouts
import { Navbar, Footer } from './components/layout';

// Pages
import {
  Home,
  Login,
  Register,
  Dashboard,
  Categories,
  CategoryQuizzes,
  QuizPlay,
  QuizResult,
  History,
  Leaderboard,
  Settings,
  AdminDashboard,
  CategoryManager,
  QuizManager,
  QuestionManager,
} from './pages';

// Route protection
import { PrivateRoute, PublicRoute, AdminRoute } from './components/ProtectedRoute';

// Auth Context Provider
import { AuthProvider } from './context/AuthContext';

// Global CSS
import './App.css';

function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-gray-900">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

// Layout for protected app pages (has sidebar, no footer)
function AppLayoutWithSidebar({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-gray-900">
      <Navbar />
      <main className="flex-1 pb-20">{children}</main>
    </div>
  );
}

function AuthLayout({ children }) {
  return <div className="min-h-screen">{children}</div>;
}

function AdminLayout({ children }) {
  return <div className="min-h-screen bg-gray-50 dark:bg-gray-900">{children}</div>;
}

function App() {
  return (
    <AuthProvider>
        <Routes>
          {/* Public Routes with Layout */}
          <Route
            element={
              <AppLayout>
                <Outlet />
              </AppLayout>
            }
          >
            <Route path="/" element={<Home />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/categories/:categoryId" element={<CategoryQuizzes />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Route>

          {/* Quiz Routes (no footer, no navbar) */}
          <Route path="/quiz/:quizId" element={<QuizPlay />} />
          <Route path="/result/:attemptId" element={<QuizResult />} />

          {/* Auth Routes */}
          <Route
            path="/sign-in"
            element={
              <PublicRoute>
                <AuthLayout>
                  <Login />
                </AuthLayout>
              </PublicRoute>
            }
          />
          <Route
            path="/sign-up"
            element={
              <PublicRoute>
                <AuthLayout>
                  <Register />
                </AuthLayout>
              </PublicRoute>
            }
          />

          {/* Protected Routes with Layout */}
          <Route
            element={
              <AppLayoutWithSidebar>
                <PrivateRoute>
                  <Outlet />
                </PrivateRoute>
              </AppLayoutWithSidebar>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <AdminRoute>
                <CategoryManager />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/quizzes"
            element={
              <AdminRoute>
                <QuizManager />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/quizzes/:quizId/questions"
            element={
              <AdminRoute>
                <QuestionManager />
              </AdminRoute>
            }
          />

          {/* 404 Page */}
          <Route
            path="*"
            element={
              <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-gray-900 dark:text-white">404</h1>
                  <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">
                    Page not found
                  </p>
                  <a
                    href="/"
                    className="mt-6 inline-block rounded-lg bg-primary-600 px-6 py-3 text-white hover:bg-primary-700"
                  >
                    Go Home
                  </a>
                </div>
              </div>
            }
          />
        </Routes>
      </AuthProvider>
  );
}

export default App;

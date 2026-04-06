import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser, SignedIn, SignedOut, useClerk, UserButton } from '@clerk/clerk-react';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import {
  Sun,
  Moon,
  Menu,
  X,
  BookOpen,
  Trophy,
  LayoutDashboard,
  LogIn,
  UserPlus,
  ChevronDown,
  Settings,
  LogOut,
  Shield,
} from 'lucide-react';

const Navbar = () => {
  const { isDark, toggleTheme } = useTheme();
  const { isSignedIn } = useUser();
  const { signOut } = useClerk();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '/', icon: null },
    { name: 'Categories', href: '/categories', icon: BookOpen },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-gray-800 dark:bg-gray-900/95">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600">
            <span className="text-lg font-bold text-white">Q</span>
          </div>
          <span className="hidden font-bold text-xl text-gray-900 dark:text-white sm:block">
            QuizGard
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={cn(
                'flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary-600',
                isActive(link.href)
                  ? 'text-primary-600'
                  : 'text-gray-600 dark:text-gray-300'
              )}
            >
              {link.icon && <link.icon className="h-4 w-4" />}
              {link.name}
            </Link>
          ))}
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
              'hover:bg-gray-100 dark:hover:bg-gray-800',
              'text-gray-600 dark:text-gray-400'
            )}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* Auth Section */}
          <SignedIn>
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 transition-colors',
                  'hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                <UserButton afterSignOutUrl="/" />
                <ChevronDown
                  className={cn(
                    'h-4 w-4 text-gray-500 transition-transform',
                    userMenuOpen && 'rotate-180'
                  )}
                />
              </button>

              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-gray-200 bg-white py-2 shadow-lg dark:border-gray-700 dark:bg-gray-800 animate-fade-in z-20">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        My Account
                      </p>
                    </div>
                    <div className="py-2">
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>
                      <Link
                        to="/history"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <BookOpen className="h-4 w-4" />
                        My History
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                    </div>
                    {/* Admin Link (placeholder) */}
                    <div className="border-t border-gray-100 dark:border-gray-700 py-2">
                      <Link
                        to="/admin"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Shield className="h-4 w-4 text-primary-600" />
                        Admin Panel
                      </Link>
                    </div>
                    {/* Logout */}
                    <div className="border-t border-gray-100 dark:border-gray-700 py-2">
                      <button
                        onClick={() => signOut()}
                        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <LogOut className="h-4 w-4" />
                        Log Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </SignedIn>

          <SignedOut>
            <div className="hidden items-center gap-2 sm:flex">
              <Link to="/sign-in">
                <Button variant="ghost" size="sm" leftIcon={<LogIn className="h-4 w-4" />}>
                  Login
                </Button>
              </Link>
              <Link to="/sign-up">
                <Button variant="default" size="sm" leftIcon={<UserPlus className="h-4 w-4" />}>
                  Sign Up
                </Button>
              </Link>
            </div>
          </SignedOut>

          {/* Mobile Menu Toggle */}
          <button
            className="flex md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-gray-200 bg-white px-4 py-4 dark:border-gray-800 dark:bg-gray-900 md:hidden animate-fade-in">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors',
                  isActive(link.href)
                    ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                )}
              >
                {link.icon && <link.icon className="h-5 w-5" />}
                {link.name}
              </Link>
            ))}
            <SignedOut>
              <div className="mt-4 flex flex-col gap-2 border-t border-gray-200 pt-4 dark:border-gray-800">
                <Link to="/sign-in" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full" leftIcon={<LogIn className="h-4 w-4" />}>
                    Login
                  </Button>
                </Link>
                <Link to="/sign-up" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full" leftIcon={<UserPlus className="h-4 w-4" />}>
                    Sign Up
                  </Button>
                </Link>
              </div>
            </SignedOut>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

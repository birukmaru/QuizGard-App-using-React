import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  Trophy,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  BarChart3,
  Users,
  FolderPlus,
  HelpCircle,
  LogOut,
} from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';

const SidebarContext = React.createContext(undefined);

export function SidebarProvider({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}

export function Sidebar({ className }) {
  const { collapsed, setCollapsed } = useSidebar();
  const location = useLocation();
  const { isAdmin } = useAuthContext();

  const isActive = (path) => location.pathname === path;

  const mainNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Categories', href: '/categories', icon: BookOpen },
    { name: 'My History', href: '/history', icon: ClipboardList },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
  ];

  const settingsNavItems = [
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Help', href: '/help', icon: HelpCircle },
  ];

  const adminNavItems = [
    { name: 'Overview', href: '/admin', icon: BarChart3 },
    { name: 'Categories', href: '/admin/categories', icon: FolderPlus },
    { name: 'Quizzes', href: '/admin/quizzes', icon: BookOpen },
    { name: 'Users', href: '/admin/users', icon: Users },
  ];

  return (
    <aside
      className={cn(
        'sticky top-16 flex h-[calc(100vh-4rem)] flex-col border-r border-gray-200 bg-white transition-all duration-300 dark:border-gray-800 dark:bg-gray-900',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          'absolute -right-3 top-6 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800',
          collapsed ? 'rotate-180' : ''
        )}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <ChevronLeft className="h-4 w-4 text-gray-500" />
      </button>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        <p
          className={cn(
            'mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400',
            collapsed && 'px-2 text-center'
          )}
        >
          {collapsed ? '---' : 'Menu'}
        </p>
        {mainNavItems.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive(item.href)
                ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white',
              collapsed && 'justify-center px-2'
            )}
            title={collapsed ? item.name : undefined}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>{item.name}</span>}
          </Link>
        ))}

        {/* Admin Section */}
        {isAdmin && (
          <>
            <div className="my-4 border-t border-gray-200 dark:border-gray-700" />
            <p
              className={cn(
                'mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400',
                collapsed && 'px-2 text-center'
              )}
            >
              {collapsed ? '---' : 'Admin'}
            </p>
            {adminNavItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive(item.href)
                    ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white',
                  collapsed && 'justify-center px-2'
                )}
                title={collapsed ? item.name : undefined}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-gray-200 p-3 dark:border-gray-800">
        <div className="space-y-1">
          {settingsNavItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive(item.href)
                  ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;

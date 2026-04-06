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
  BarChart3,
  FolderPlus,
  HelpCircle,
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
  ];

  return (
    <aside
      className={cn(
        'fixed left-0 top-16 z-30 flex h-[calc(100vh-4rem)] flex-col border-r border-gray-200 bg-white transition-all duration-300 dark:border-gray-800 dark:bg-gray-900',
        collapsed ? 'w-16' : 'w-64',
        'max-md:-translate-x-full md:translate-x-0',
        className
      )}
    >
      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <p
          className={cn(
            'mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400',
            collapsed && 'hidden'
          )}
        >
          Menu
        </p>
        {mainNavItems.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
              isActive(item.href)
                ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white',
              collapsed && 'justify-center px-0'
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
                collapsed && 'hidden'
              )}
            >
              Admin
            </p>
            {adminNavItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive(item.href)
                    ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white',
                  collapsed && 'justify-center px-0'
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
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive(item.href)
                  ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white',
                collapsed && 'justify-center px-0'
              )}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          ))}

          {/* Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
              'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white',
              collapsed && 'justify-center px-0'
            )}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5" />
            ) : (
              <>
                <ChevronLeft className="h-5 w-5 transition-transform duration-200 group-hover:-translate-x-0.5" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
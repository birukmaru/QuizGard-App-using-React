import React from 'react';
import { cn } from '@/lib/utils';

const badgeVariants = {
  variant: {
    default: 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200',
    secondary: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    success: 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200',
    warning: 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200',
    danger: 'bg-danger-100 text-danger-800 dark:bg-danger-900 dark:text-danger-200',
    outline: 'border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300',
    subtle: 'bg-gray-100/50 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400',
  },
  size: {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base',
  },
};

function Badge({
  children,
  className,
  variant = 'default',
  size = 'md',
  icon,
  iconPosition = 'left',
  ...props
}) {
  return (
    <span
      className={cn(
        // Base styles
        'inline-flex items-center gap-1 rounded-full font-medium transition-colors',

        // Variant styles
        badgeVariants.variant[variant],

        // Size styles
        badgeVariants.size[size],

        className
      )}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
    </span>
  );
}

// Specialized badge components
function StatusBadge({ status, ...props }) {
  const statusConfig = {
    active: { variant: 'success', label: 'Active' },
    inactive: { variant: 'secondary', label: 'Inactive' },
    pending: { variant: 'warning', label: 'Pending' },
    draft: { variant: 'subtle', label: 'Draft' },
    published: { variant: 'success', label: 'Published' },
    archived: { variant: 'secondary', label: 'Archived' },
    completed: { variant: 'success', label: 'Completed' },
    in_progress: { variant: 'warning', label: 'In Progress' },
    failed: { variant: 'danger', label: 'Failed' },
  };

  const config = statusConfig[status] || { variant: 'secondary', label: status };

  return (
    <Badge variant={config.variant} {...props}>
      {config.label}
    </Badge>
  );
}

function DifficultyBadge({ difficulty, ...props }) {
  const difficultyConfig = {
    easy: { variant: 'success', label: 'Easy' },
    medium: { variant: 'warning', label: 'Medium' },
    hard: { variant: 'danger', label: 'Hard' },
  };

  const config = difficultyConfig[difficulty] || { variant: 'secondary', label: difficulty };

  return (
    <Badge variant={config.variant} size="sm" {...props}>
      {config.label}
    </Badge>
  );
}

export { Badge, badgeVariants, StatusBadge, DifficultyBadge };

import React from 'react';
import { cn } from '@/lib/utils';

const spinnerVariants = {
  size: {
    xs: 'h-4 w-4 border-2',
    sm: 'h-6 w-6 border-2',
    md: 'h-8 w-8 border-[3px]',
    lg: 'h-12 w-12 border-4',
    xl: 'h-16 w-16 border-4',
  },
  color: {
    default: 'border-gray-200 border-t-primary-600',
    primary: 'border-primary-200 border-t-primary-600',
    white: 'border-white/30 border-t-white',
    success: 'border-success-200 border-t-success-600',
    danger: 'border-danger-200 border-t-danger-600',
  },
};

export function Spinner({
  className,
  size = 'md',
  color = 'default',
  label = 'Loading...',
  fullPage = false,
}) {
  const spinner = (
    <div
      className={cn(
        'inline-block animate-spin rounded-full border-solid',
        spinnerVariants.size[size],
        spinnerVariants.color[color],
        className
      )}
      role="status"
      aria-label={label}
    >
      <span className="sr-only">{label}</span>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
        {spinner}
      </div>
    );
  }

  return spinner;
}

// Pulse dot animation for skeleton loaders
export function PulseDot({ className, color = 'bg-primary-500' }) {
  return (
    <span
      className={cn(
        'inline-block h-2 w-2 rounded-full animate-pulse',
        color,
        className
      )}
    />
  );
}

// Skeleton loader component
export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gray-200 dark:bg-gray-700',
        className
      )}
      {...props}
    />
  );
}

// Skeleton text lines
export function SkeletonText({
  lines = 3,
  className,
  lastLineWidth = '75%',
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          style={{ width: i === lines - 1 ? lastLineWidth : '100%' }}
        />
      ))}
    </div>
  );
}

// Card skeleton
export function CardSkeleton({ className }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200 bg-white p-6 space-y-4',
        'dark:border-gray-700 dark:bg-gray-800',
        className
      )}
    >
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
      <SkeletonText lines={2} />
    </div>
  );
}

// Full page loading state
export function LoadingState({
  message = 'Loading...',
  className,
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center min-h-[400px] gap-4',
        className
      )}
    >
      <Spinner size="lg" color="primary" />
      <p className="text-gray-500 dark:text-gray-400">{message}</p>
    </div>
  );
}

export default Spinner;

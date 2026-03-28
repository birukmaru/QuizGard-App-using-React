import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const buttonVariants = {
  variant: {
    default: 'bg-primary text-white hover:bg-primary-600 focus-visible:ring-primary',
    destructive: 'bg-danger text-white hover:bg-danger-600 focus-visible:ring-danger',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white focus-visible:ring-primary',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 focus-visible:ring-gray-500',
    ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:ring-gray-500',
    link: 'text-primary underline-offset-4 hover:underline focus-visible:ring-primary',
    success: 'bg-success text-white hover:bg-success-600 focus-visible:ring-success',
    warning: 'bg-warning text-white hover:bg-warning-600 focus-visible:ring-warning',
  },
  size: {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 px-3 text-sm',
    lg: 'h-11 px-8 text-lg',
    xl: 'h-12 px-10 text-xl',
    icon: 'h-10 w-10',
    iconSm: 'h-8 w-8',
    iconLg: 'h-12 w-12',
    full: 'h-10 px-4 py-2 w-full',
  },
};

const Button = forwardRef(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      isLoading = false,
      isDisabled = false,
      leftIcon,
      rightIcon,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const disabled = isDisabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500',
          'disabled:pointer-events-none disabled:opacity-50',
          'active:scale-[0.98]', // Subtle press effect

          // Variant styles
          buttonVariants.variant[variant],

          // Size styles
          buttonVariants.size[size],

          // Loading state
          isLoading && 'cursor-wait',

          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };

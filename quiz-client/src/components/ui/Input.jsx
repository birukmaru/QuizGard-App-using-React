import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const inputVariants = {
  base: 'flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500',
  error: 'border-danger-500 focus-visible:ring-danger-500',
  success: 'border-success-500 focus-visible:ring-success-500',
};

const Input = forwardRef(
  (
    {
      className,
      type = 'text',
      error,
      success,
      leftIcon,
      rightIcon,
      label,
      helperText,
      errorText,
      containerClassName,
      ...props
    },
    ref
  ) => {
    const isError = !!error || !!errorText;
    const variant = isError ? 'error' : success ? 'success' : 'base';

    return (
      <div className={cn('w-full space-y-2', containerClassName)}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
            {props.required && <span className="ml-1 text-danger">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            type={type}
            className={cn(
              inputVariants.base,
              inputVariants[variant],
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        {(helperText || errorText || error) && (
          <p
            className={cn(
              'text-xs',
              isError ? 'text-danger' : 'text-gray-500 dark:text-gray-400'
            )}
          >
            {errorText || error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Textarea = forwardRef(
  (
    {
      className,
      error,
      success,
      label,
      helperText,
      errorText,
      containerClassName,
      rows = 4,
      maxLength,
      showCount = false,
      ...props
    },
    ref
  ) => {
    const isError = !!error || !!errorText;
    const variant = isError ? 'border-danger focus:ring-danger-500' : success ? 'border-success focus:ring-success-500' : '';

    return (
      <div className={cn('w-full space-y-2', containerClassName)}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
            {props.required && <span className="ml-1 text-danger">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          rows={rows}
          maxLength={maxLength}
          className={cn(
            // Base styles
            'flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm',
            'transition-colors placeholder:text-gray-400 resize-none',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
            'focus-visible:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50',
            'dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500',
            // Variant
            variant,
            className
          )}
          {...props}
        />
        <div className="flex justify-between">
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
          {showCount && maxLength && (
            <p className="text-xs text-gray-400">
              {props.value?.length || 0}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, Check } from 'lucide-react';

const Select = forwardRef(
  (
    {
      className,
      options = [],
      value,
      onChange,
      placeholder = 'Select an option',
      label,
      error,
      helperText,
      disabled = false,
      containerClassName,
      ...props
    },
    ref
  ) => {
    const isError = !!error;

    return (
      <div className={cn('w-full space-y-2', containerClassName)}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
            {props.required && <span className="ml-1 text-danger">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={cn(
              // Base styles
              'flex w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 pr-10 text-sm',
              'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
              'focus-visible:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50',
              'dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100',
              // Error state
              isError && 'border-danger focus-visible:ring-danger-500',
              // Custom arrow
              className
            )}
            {...props}
          >
            <option value="" disabled>
              {placeholder}
            </option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </div>
        {(helperText || error) && (
          <p className={cn('text-xs', isError ? 'text-danger' : 'text-gray-500 dark:text-gray-400')}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

// Multi-select variant
export function MultiSelect({
  options = [],
  value = [],
  onChange,
  placeholder = 'Select options',
  label,
  error,
  disabled = false,
  maxSelections,
  containerClassName,
}) {
  const isError = !!error;

  const handleToggle = (optionValue) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      if (maxSelections && value.length >= maxSelections) return;
      onChange([...value, optionValue]);
    }
  };

  return (
    <div className={cn('w-full space-y-2', containerClassName)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <div
        className={cn(
          'min-h-[42px] w-full rounded-lg border border-gray-300 bg-white p-2',
          'dark:border-gray-600 dark:bg-gray-800',
          isError && 'border-danger',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        {value.length === 0 ? (
          <span className="text-gray-400 text-sm">{placeholder}</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {value.map((v) => {
              const option = options.find((o) => o.value === v);
              return (
                <span
                  key={v}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-800 rounded text-xs"
                >
                  {option?.label || v}
                  <button
                    type="button"
                    onClick={() => handleToggle(v)}
                    className="hover:text-primary-900"
                  >
                    x
                  </button>
                </span>
              );
            })}
          </div>
        )}
      </div>
      {maxSelections && (
        <p className="text-xs text-gray-500">
          {value.length}/{maxSelections} selected
        </p>
      )}
    </div>
  );
}

export default Select;

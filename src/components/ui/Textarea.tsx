// Componente de textarea estilizado com contador de caracteres
import { TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  maxCharacters?: number;
  currentLength?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, maxCharacters, currentLength, className, id, ...props },
  ref
) {
  const inputId = id || 'textarea';
  const isNearLimit = maxCharacters && currentLength ? currentLength > maxCharacters * 0.9 : false;
  const isOverLimit = maxCharacters && currentLength ? currentLength > maxCharacters : false;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        className={cn(
          'w-full px-3 py-2 border rounded-lg text-sm text-gray-900 placeholder-gray-400 bg-white',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          'resize-none transition-colors duration-200',
          error ? 'border-red-500' : 'border-gray-300 hover:border-gray-400',
          className
        )}
        aria-describedby={error ? `${inputId}-error` : undefined}
        aria-invalid={!!error}
        {...props}
      />
      <div className="flex justify-between items-center">
        {error ? (
          <p id={`${inputId}-error`} className="text-xs text-red-600" role="alert">
            {error}
          </p>
        ) : (
          <span />
        )}
        {maxCharacters !== undefined && currentLength !== undefined && (
          <span
            className={cn(
              'text-xs',
              isOverLimit ? 'text-red-600 font-medium' : isNearLimit ? 'text-amber-600' : 'text-gray-400'
            )}
            aria-live="polite"
          >
            {currentLength}/{maxCharacters}
          </span>
        )}
      </div>
    </div>
  );
});

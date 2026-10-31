// Componente de alerta/feedback com variantes visuais
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AlertProps {
  variant: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Alert({ variant, title, children, className }: AlertProps) {
  const variantStyles = {
    success: {
      container: 'bg-green-50 border-green-200 text-green-800',
      icon: '✅',
    },
    error: {
      container: 'bg-red-50 border-red-200 text-red-800',
      icon: '❌',
    },
    warning: {
      container: 'bg-amber-50 border-amber-200 text-amber-800',
      icon: '⚠️',
    },
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: 'ℹ️',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      role="alert"
      className={cn(
        'flex gap-3 p-4 rounded-lg border',
        styles.container,
        className
      )}
    >
      <span className="text-lg flex-shrink-0" aria-hidden="true">{styles.icon}</span>
      <div className="flex flex-col gap-1">
        {title && <p className="font-semibold text-sm">{title}</p>}
        <p className="text-sm">{children}</p>
      </div>
    </div>
  );
}

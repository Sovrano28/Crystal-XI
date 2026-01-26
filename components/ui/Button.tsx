'use client';

import { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'glow' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = cn(
      'inline-flex items-center justify-center gap-2',
      'font-semibold rounded-xl',
      'transition-all duration-250 ease-out',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none',
      'active:scale-[0.98]'
    );

    const variants = {
      primary: cn(
        'bg-gradient-to-br from-[var(--pl-magenta)] to-[var(--pl-magenta-dark)]',
        'text-white shadow-md',
        'hover:shadow-lg hover:shadow-[var(--pl-magenta)]/30 hover:-translate-y-0.5',
        'focus-visible:ring-[var(--pl-magenta)]'
      ),
      secondary: cn(
        'bg-[var(--surface)] backdrop-blur-xl',
        'text-[var(--foreground)] border border-[var(--surface-border)]',
        'hover:bg-[var(--surface-hover)] hover:border-[var(--pl-magenta)] hover:text-[var(--pl-magenta)]',
        'focus-visible:ring-[var(--pl-magenta)]'
      ),
      ghost: cn(
        'bg-transparent text-[var(--foreground)]',
        'hover:bg-[var(--surface)]',
        'focus-visible:ring-[var(--pl-magenta)]'
      ),
      glow: cn(
        'bg-gradient-to-br from-[var(--pl-cyan)] to-[var(--pl-cyan-dark)]',
        'text-[var(--pl-purple-dark)] font-bold shadow-md',
        'hover:shadow-lg hover:shadow-[var(--pl-cyan)]/40 hover:-translate-y-0.5',
        'focus-visible:ring-[var(--pl-cyan)]'
      ),
      outline: cn(
        'bg-transparent border-2 border-[var(--surface-border)]',
        'text-[var(--foreground)]',
        'hover:border-[var(--pl-magenta)] hover:text-[var(--pl-magenta)]',
        'focus-visible:ring-[var(--pl-magenta)]'
      ),
      danger: cn(
        'bg-gradient-to-br from-red-500 to-red-600',
        'text-white shadow-md',
        'hover:shadow-lg hover:shadow-red-500/30 hover:-translate-y-0.5',
        'focus-visible:ring-red-500'
      ),
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-5 py-2.5 text-base',
      lg: 'px-8 py-3.5 text-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <LoadingSpinner size={size} />
            <span>Loading...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

function LoadingSpinner({ size }: { size: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <svg
      className={cn('animate-spin', sizes[size])}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

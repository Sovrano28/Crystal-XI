'use client';

import { HTMLAttributes, ReactNode, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'interactive' | 'bordered';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  glow?: boolean;
  glowColor?: 'magenta' | 'cyan';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = 'default',
      padding = 'md',
      glow = false,
      glowColor = 'magenta',
      className,
      ...props
    },
    ref
  ) => {
    const baseStyles = cn(
      'rounded-2xl',
      'bg-[var(--surface)] backdrop-blur-xl',
      'border border-[var(--surface-border)]',
      'transition-all duration-300 ease-out'
    );

    const variants = {
      default: 'shadow-[var(--shadow-md)]',
      elevated: cn(
        'bg-[var(--surface-elevated)]',
        'shadow-[var(--shadow-lg)]'
      ),
      interactive: cn(
        'shadow-[var(--shadow-md)]',
        'hover:shadow-[var(--shadow-lg)]',
        'hover:border-[var(--surface-border-hover)]',
        'hover:-translate-y-1',
        'cursor-pointer'
      ),
      bordered: cn(
        'shadow-none',
        'border-2'
      ),
    };

    const paddings = {
      none: '',
      sm: 'p-3',
      md: 'p-5',
      lg: 'p-8',
    };

    const glowStyles = glow
      ? glowColor === 'magenta'
        ? 'shadow-[var(--shadow-glow)] hover:shadow-[0_0_50px_rgba(255,40,130,0.4)]'
        : 'shadow-[var(--shadow-glow-cyan)] hover:shadow-[0_0_50px_rgba(0,255,135,0.4)]'
      : '';

    return (
      <div
        ref={ref}
        className={cn(baseStyles, variants[variant], paddings[padding], glowStyles, className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card Header component
interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('pb-4 border-b border-[var(--surface-border)]', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

// Card Title component
interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ children, as: Component = 'h3', className, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn('text-lg font-semibold text-[var(--foreground)]', className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

CardTitle.displayName = 'CardTitle';

// Card Description component
interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}

export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn('text-sm text-[var(--foreground-muted)] mt-1', className)}
        {...props}
      >
        {children}
      </p>
    );
  }
);

CardDescription.displayName = 'CardDescription';

// Card Content component
interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('pt-4', className)} {...props}>
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';

// Card Footer component
interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('pt-4 mt-4 border-t border-[var(--surface-border)] flex items-center gap-3', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

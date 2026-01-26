'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'shimmer' | 'none';
}

export function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  animation = 'shimmer',
}: SkeletonProps) {
  const variants = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };

  const animations = {
    pulse: 'animate-pulse bg-[var(--surface)]',
    shimmer: cn(
      'bg-gradient-to-r',
      'from-[var(--surface)] via-[var(--surface-hover)] to-[var(--surface)]',
      'bg-[length:200%_100%]',
      'animate-shimmer'
    ),
    none: 'bg-[var(--surface)]',
  };

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={cn(variants[variant], animations[animation], className)}
      style={style}
    />
  );
}

// Pre-built skeleton components for common use cases

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className={cn('h-4', i === lines - 1 && 'w-3/4')}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'p-6 rounded-2xl',
        'bg-[var(--surface)] backdrop-blur-xl',
        'border border-[var(--surface-border)]',
        className
      )}
    >
      <div className="flex items-center gap-4 mb-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  );
}

export function SkeletonAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 32,
    md: 48,
    lg: 64,
  };

  return <Skeleton variant="circular" width={sizes[size]} height={sizes[size]} />;
}

export function SkeletonButton({ className }: { className?: string }) {
  return <Skeleton className={cn('h-10 w-24', className)} />;
}

export function SkeletonPlayerCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'p-4 rounded-xl',
        'bg-[var(--surface)] backdrop-blur-xl',
        'border border-[var(--surface-border)]',
        className
      )}
    >
      <div className="flex items-center gap-3 mb-3">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1">
          <Skeleton className="h-4 w-24 mb-1" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-6 w-12" />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 flex-1" />
        ))}
      </div>
    </div>
  );
}

export function SkeletonStatsCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'p-5 rounded-2xl',
        'bg-[var(--surface)] backdrop-blur-xl',
        'border border-[var(--surface-border)]',
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton variant="circular" width={32} height={32} />
      </div>
      <Skeleton className="h-8 w-24 mb-2" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

'use client';

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'fdr';
  size?: 'sm' | 'md' | 'lg';
  fdrValue?: 1 | 2 | 3 | 4 | 5;
  glow?: boolean;
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  fdrValue,
  glow = false,
  className,
}: BadgeProps) {
  const baseStyles = cn(
    'inline-flex items-center justify-center',
    'font-semibold rounded-lg',
    'transition-all duration-200'
  );

  const variants = {
    default: 'bg-[var(--surface)] text-[var(--foreground)] border border-[var(--surface-border)]',
    success: 'bg-[var(--pl-cyan)]/20 text-[var(--pl-cyan)] border border-[var(--pl-cyan)]/30',
    warning: 'bg-amber-500/20 text-amber-500 border border-amber-500/30',
    danger: 'bg-red-500/20 text-red-500 border border-red-500/30',
    info: 'bg-[var(--pl-magenta)]/20 text-[var(--pl-magenta)] border border-[var(--pl-magenta)]/30',
    fdr: '', // Will be set based on fdrValue
  };

  const fdrStyles = {
    1: 'bg-[var(--fdr-1)] text-[var(--pl-purple-dark)]',
    2: 'bg-[var(--fdr-2)] text-[var(--pl-purple-dark)]',
    3: 'bg-[var(--fdr-3)] text-[var(--pl-purple-dark)]',
    4: 'bg-[var(--fdr-4)] text-white',
    5: 'bg-[var(--fdr-5)] text-white',
  };

  const fdrGlow = {
    1: 'shadow-[0_0_12px_rgba(0,255,135,0.5)]',
    2: '',
    3: '',
    4: '',
    5: 'shadow-[0_0_12px_rgba(255,23,81,0.5)]',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  const variantStyle = variant === 'fdr' && fdrValue ? fdrStyles[fdrValue] : variants[variant];
  const glowStyle = variant === 'fdr' && fdrValue && glow ? fdrGlow[fdrValue] : '';

  return (
    <span className={cn(baseStyles, variantStyle, sizes[size], glowStyle, className)}>
      {children}
    </span>
  );
}

// FDR Badge specifically for Fixture Difficulty Rating
interface FDRBadgeProps {
  difficulty: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  showLabel?: boolean;
  className?: string;
}

export function FDRBadge({
  difficulty,
  size = 'md',
  showNumber = true,
  showLabel = false,
  className,
}: FDRBadgeProps) {
  const labels = {
    1: 'Very Easy',
    2: 'Easy',
    3: 'Medium',
    4: 'Hard',
    5: 'Very Hard',
  };

  const fdrValue = Math.min(5, Math.max(1, difficulty)) as 1 | 2 | 3 | 4 | 5;

  return (
    <Badge
      variant="fdr"
      fdrValue={fdrValue}
      size={size}
      glow={fdrValue === 1 || fdrValue === 5}
      className={className}
    >
      {showNumber && <span className="font-bold">{fdrValue}</span>}
      {showLabel && <span className="ml-1">{labels[fdrValue]}</span>}
    </Badge>
  );
}

// DGW/BGW Badges
interface GameweekBadgeProps {
  type: 'dgw' | 'bgw';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function GameweekBadge({ type, size = 'sm', className }: GameweekBadgeProps) {
  const styles = {
    dgw: 'bg-gradient-to-r from-amber-400 to-amber-500 text-amber-900',
    bgw: 'bg-gray-500/80 text-white',
  };

  const labels = {
    dgw: 'DGW',
    bgw: 'BGW',
  };

  const sizes = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    md: 'px-2 py-0.5 text-xs',
    lg: 'px-2.5 py-1 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center',
        'font-bold rounded',
        styles[type],
        sizes[size],
        type === 'dgw' && 'animate-pulse',
        className
      )}
    >
      {labels[type]}
    </span>
  );
}

// Position Badge
interface PositionBadgeProps {
  position: 1 | 2 | 3 | 4;
  size?: 'sm' | 'md' | 'lg';
  showFull?: boolean;
  className?: string;
}

export function PositionBadge({ position, size = 'sm', showFull = false, className }: PositionBadgeProps) {
  const positions = {
    1: { short: 'GK', full: 'Goalkeeper', color: 'bg-amber-500/20 text-amber-500 border-amber-500/30' },
    2: { short: 'DEF', full: 'Defender', color: 'bg-green-500/20 text-green-500 border-green-500/30' },
    3: { short: 'MID', full: 'Midfielder', color: 'bg-blue-500/20 text-blue-500 border-blue-500/30' },
    4: { short: 'FWD', full: 'Forward', color: 'bg-red-500/20 text-red-500 border-red-500/30' },
  };

  const sizes = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    md: 'px-2 py-0.5 text-xs',
    lg: 'px-2.5 py-1 text-sm',
  };

  const pos = positions[position];

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center',
        'font-semibold rounded border',
        pos.color,
        sizes[size],
        className
      )}
    >
      {showFull ? pos.full : pos.short}
    </span>
  );
}

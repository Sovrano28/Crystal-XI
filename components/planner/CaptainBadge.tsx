'use client';

import { cn } from '@/lib/utils';
import { Fragment } from 'react';

interface CaptainBadgeProps {
  type: 'C' | 'V';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function CaptainBadge({ type, className, size = 'md' }: CaptainBadgeProps) {
  const sizeClasses = {
    sm: 'w-5 h-5 text-[10px] border',
    md: 'w-6 h-6 text-xs border-[1.5px]',
    lg: 'w-8 h-8 text-sm border-2',
  };

  return (
    <div
      className={cn(
        'relative flex items-center justify-center rounded-full font-bold',
        // Glassmorphism Base
        'bg-black/40 backdrop-blur-md',
        // Text Color
        'text-white',
        // Neon Glow & Borders
        type === 'C' 
          ? 'border-[var(--pl-cyan)] shadow-[0_0_10px_rgba(0,255,255,0.5),inset_0_0_5px_rgba(0,255,255,0.3)]' 
          : 'border-[var(--pl-magenta)] shadow-[0_0_10px_rgba(255,0,255,0.5),inset_0_0_5px_rgba(255,0,255,0.3)]',
        // Size
        sizeClasses[size],
        className
      )}
    >
      <span className="drop-shadow-md">{type}</span>
      
      {/* Inner Ring for extra depth */}
      <div className={cn(
        "absolute inset-[2px] rounded-full border opacity-50",
        type === 'C' ? 'border-cyan-200' : 'border-fuchsia-200'
      )} />
    </div>
  );
}

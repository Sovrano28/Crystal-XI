'use client';

import { cn } from '@/lib/utils';
import { ReactNode, useState } from 'react';

interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

export function Tooltip({
  children,
  content,
  position = 'top',
  delay = 200,
  className,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    const id = setTimeout(() => setIsVisible(true), delay);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    setIsVisible(false);
  };

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrows = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-[var(--surface-elevated)] border-x-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-[var(--surface-elevated)] border-x-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-[var(--surface-elevated)] border-y-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-[var(--surface-elevated)] border-y-transparent border-l-transparent',
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      
      {/* Tooltip content */}
      <div
        className={cn(
          'absolute z-[var(--z-tooltip)]',
          positions[position],
          'pointer-events-none',
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
          'transition-all duration-200 ease-out'
        )}
      >
        <div
          className={cn(
            'px-3 py-2 rounded-lg',
            'bg-[var(--surface-elevated)] backdrop-blur-xl',
            'border border-[var(--surface-border)]',
            'shadow-[var(--shadow-lg)]',
            'text-sm text-[var(--foreground)]',
            'whitespace-nowrap',
            className
          )}
        >
          {content}
        </div>
        
        {/* Arrow */}
        <div
          className={cn(
            'absolute w-0 h-0',
            'border-[6px]',
            arrows[position]
          )}
        />
      </div>
    </div>
  );
}

// Info tooltip with icon
interface InfoTooltipProps {
  content: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function InfoTooltip({ content, position = 'top', className }: InfoTooltipProps) {
  return (
    <Tooltip content={content} position={position} className={className}>
      <button
        type="button"
        className={cn(
          'inline-flex items-center justify-center',
          'w-5 h-5 rounded-full',
          'text-[var(--foreground-muted)] hover:text-[var(--foreground)]',
          'bg-[var(--surface)] hover:bg-[var(--surface-hover)]',
          'transition-colors duration-200'
        )}
      >
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </Tooltip>
  );
}

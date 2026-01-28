'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { GameweekBadge } from '@/components/ui/Badge';

interface GameweekSliderProps {
  gameweeks: number[];
  currentGameweek: number;
  selectedGameweeks: number[];
  dgwGameweeks?: number[];
  bgwGameweeks?: number[];
  onSelectionChange: (gameweeks: number[]) => void;
  onSingleSelect?: (gameweek: number) => void;
  mode?: 'single' | 'range';
}

export function GameweekSlider({
  gameweeks,
  currentGameweek,
  selectedGameweeks,
  dgwGameweeks = [],
  bgwGameweeks = [],
  onSelectionChange,
  onSingleSelect,
  mode = 'range',
}: GameweekSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to current gameweek on mount
  useEffect(() => {
    if (scrollRef.current) {
      const currentGwElement = scrollRef.current.querySelector(`[data-gw="${currentGameweek}"]`);
      if (currentGwElement) {
        currentGwElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [currentGameweek]);

  const handleGameweekClick = (gw: number) => {
    if (mode === 'single') {
      onSingleSelect?.(gw);
      onSelectionChange([gw]);
    } else {
      if (selectedGameweeks.includes(gw)) {
        onSelectionChange(selectedGameweeks.filter((g) => g !== gw));
      } else {
        onSelectionChange([...selectedGameweeks, gw].sort((a, b) => a - b));
      }
    }
  };

  // Navigate to previous gameweek (for single mode)
  const goToPrevious = () => {
    if (mode === 'single' && selectedGameweeks.length > 0) {
      const currentSelected = selectedGameweeks[0];
      const prevGw = gameweeks.find((gw) => gw < currentSelected);
      const prevGwFinal = gameweeks.filter((gw) => gw < currentSelected).pop();
      if (prevGwFinal !== undefined) {
        onSingleSelect?.(prevGwFinal);
        onSelectionChange([prevGwFinal]);
        // Scroll to the new selection
        setTimeout(() => {
          const el = scrollRef.current?.querySelector(`[data-gw="${prevGwFinal}"]`);
          el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }, 100);
      }
    } else {
      scrollRef.current?.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  // Navigate to next gameweek (for single mode)
  const goToNext = () => {
    if (mode === 'single' && selectedGameweeks.length > 0) {
      const currentSelected = selectedGameweeks[0];
      const nextGw = gameweeks.find((gw) => gw > currentSelected);
      if (nextGw !== undefined) {
        onSingleSelect?.(nextGw);
        onSelectionChange([nextGw]);
        // Scroll to the new selection
        setTimeout(() => {
          const el = scrollRef.current?.querySelector(`[data-gw="${nextGw}"]`);
          el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }, 100);
      }
    } else {
      scrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  const canGoPrev = selectedGameweeks.length > 0 && selectedGameweeks[0] > gameweeks[0];
  const canGoNext = selectedGameweeks.length > 0 && selectedGameweeks[0] < gameweeks[gameweeks.length - 1];

  return (
    <div className="relative">
      {/* Navigation Buttons */}
      <button
        onClick={goToPrevious}
        disabled={!canGoPrev}
        className={cn(
          'absolute left-0 top-1/2 -translate-y-1/2 z-10',
          'w-10 h-10 rounded-xl',
          'bg-[var(--surface)] backdrop-blur-xl',
          'border border-[var(--surface-border)]',
          'flex items-center justify-center',
          'text-[var(--foreground)] hover:text-[var(--pl-magenta)]',
          'shadow-[var(--shadow-md)]',
          'transition-all duration-200',
          'hover:shadow-[var(--shadow-lg)]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'hidden md:flex'
        )}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={goToNext}
        disabled={!canGoNext}
        className={cn(
          'absolute right-0 top-1/2 -translate-y-1/2 z-10',
          'w-10 h-10 rounded-xl',
          'bg-[var(--surface)] backdrop-blur-xl',
          'border border-[var(--surface-border)]',
          'flex items-center justify-center',
          'text-[var(--foreground)] hover:text-[var(--pl-magenta)]',
          'shadow-[var(--shadow-md)]',
          'transition-all duration-200',
          'hover:shadow-[var(--shadow-lg)]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'hidden md:flex'
        )}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Gameweeks Container */}
      <div
        ref={scrollRef}
        className={cn(
          'flex gap-2 overflow-x-auto py-2 px-0 md:px-12',
          'hide-scrollbar',
          'scroll-smooth'
        )}
      >
        {gameweeks.map((gw) => {
          const isSelected = selectedGameweeks.includes(gw);
          const isCurrent = gw === currentGameweek;
          const isDGW = dgwGameweeks.includes(gw);
          const isBGW = bgwGameweeks.includes(gw);

          return (
            <button
              key={gw}
              data-gw={gw}
              onClick={() => handleGameweekClick(gw)}
              className={cn(
                'relative flex-shrink-0',
                'w-14 h-14 rounded-xl',
                'flex flex-col items-center justify-center',
                'font-medium text-sm',
                'transition-all duration-200',
                'border-2',
                isSelected
                  ? 'bg-gradient-to-br from-[var(--pl-magenta)] to-[var(--pl-magenta-dark)] text-white border-[var(--pl-magenta)] shadow-lg shadow-[var(--pl-magenta)]/30'
                  : isCurrent
                  ? 'bg-[var(--surface)] border-[var(--pl-cyan)] text-[var(--pl-cyan)]'
                  : 'bg-[var(--surface)] border-[var(--surface-border)] text-[var(--foreground)] hover:border-[var(--pl-magenta)]/50',
                'hover:scale-105'
              )}
            >
              <span className="text-xs opacity-70">GW</span>
              <span className="font-bold">{gw}</span>

              {/* DGW/BGW indicator */}
              {(isDGW || isBGW) && (
                <div className="absolute -top-1 -right-1">
                  <GameweekBadge type={isDGW ? 'dgw' : 'bgw'} size="sm" />
                </div>
              )}

              {/* Current indicator */}
              {isCurrent && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[var(--pl-cyan)]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Quick Jump Buttons component
interface QuickJumpButtonsProps {
  currentGameweek: number;
  totalGameweeks: number;
  onQuickJump: (gameweeks: number[]) => void;
}

export function QuickJumpButtons({ currentGameweek, totalGameweeks, onQuickJump }: QuickJumpButtonsProps) {
  const ranges = [
    { label: 'Next 5', count: 5 },
    { label: 'Next 10', count: 10 },
    { label: 'Rest of Season', count: totalGameweeks - currentGameweek + 1 },
  ];

  const handleQuickJump = (count: number) => {
    const gameweeks = [];
    for (let i = 0; i < count && currentGameweek + i <= totalGameweeks; i++) {
      gameweeks.push(currentGameweek + i);
    }
    onQuickJump(gameweeks);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {ranges.map((range) => (
        <Button
          key={range.label}
          variant="secondary"
          size="sm"
          onClick={() => handleQuickJump(range.count)}
        >
          {range.label}
        </Button>
      ))}
    </div>
  );
}

// View Toggle component
interface ViewToggleProps {
  view: 'pitch' | 'grid';
  onViewChange: (view: 'pitch' | 'grid') => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div
      className={cn(
        'inline-flex p-1 rounded-xl',
        'bg-[var(--surface)] backdrop-blur-xl',
        'border border-[var(--surface-border)]'
      )}
    >
      <button
        onClick={() => onViewChange('pitch')}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg',
          'text-sm font-medium',
          'transition-all duration-200',
          view === 'pitch'
            ? 'bg-gradient-to-r from-[var(--pl-magenta)] to-[var(--pl-magenta-dark)] text-white shadow-md'
            : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
        )}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
        Pitch
      </button>
      <button
        onClick={() => onViewChange('grid')}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg',
          'text-sm font-medium',
          'transition-all duration-200',
          view === 'grid'
            ? 'bg-gradient-to-r from-[var(--pl-magenta)] to-[var(--pl-magenta-dark)] text-white shadow-md'
            : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
        )}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
        Grid
      </button>
    </div>
  );
}

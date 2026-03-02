import React from 'react';
import { FPLFixture, PlayerFixture } from '@/types/fpl';

interface FixtureDifficultyGridProps {
  fixtures: PlayerFixture[]; // Use the PlayerFixture type which aligns with getPlayerFixtures
  maxFixtures?: number;
}

// FPL Fixture Difficulty Rating (FDR) colors
export const fdrColors: Record<number, { bg: string, text: string }> = {
  1: { bg: 'bg-emerald-600', text: 'text-white' },
  2: { bg: 'bg-emerald-400', text: 'text-slate-900' },
  3: { bg: 'bg-slate-200', text: 'text-slate-900' },
  4: { bg: 'bg-rose-500', text: 'text-white' },
  5: { bg: 'bg-rose-700', text: 'text-white' },
};

export function FixtureDifficultyGrid({ fixtures, maxFixtures = 5 }: FixtureDifficultyGridProps) {
  // Sort fixtures by gameweek and take the first `maxFixtures`
  const upcoming = [...fixtures].sort((a, b) => a.gameweek - b.gameweek).slice(0, maxFixtures);

  if (upcoming.length === 0) {
    return <div className="text-sm text-slate-500 dark:text-slate-400 italic">No fixtures</div>;
  }

  return (
    <div className="flex w-full items-center gap-[2px]">
      {upcoming.map((fixture, idx) => {
        const difficulty = fixture.difficulty || 3;
        const colors = fdrColors[difficulty] || fdrColors[3];
        const isHome = fixture.isHome;
        const opponentShort = fixture.opponent.short_name;

        return (
          <div 
            key={`${fixture.fixture.id}-${idx}`}
            className={`flex-1 flex flex-col items-center justify-center p-1 rounded-sm text-xs font-semibold ${colors.bg} ${colors.text} shadow-sm transition-transform hover:scale-105`}
            title={`GW${fixture.gameweek}: ${opponentShort} (${isHome ? 'H' : 'A'}) - FDR ${difficulty}`}
          >
            <span className="uppercase text-[10px] leading-none opacity-90">{opponentShort}</span>
            <span className="font-bold leading-tight">{isHome ? 'H' : 'A'}</span>
          </div>
        );
      })}
      
      {/* Fill empty slots if less than maxFixtures */}
      {Array.from({ length: Math.max(0, maxFixtures - upcoming.length) }).map((_, i) => (
        <div 
          key={`empty-${i}`}
          className="flex-1 flex flex-col items-center justify-center p-1 rounded-sm text-xs bg-slate-100 dark:bg-slate-800/50 text-slate-400 border border-slate-200 dark:border-slate-700 border-dashed"
        >
          <span className="text-[10px]">-</span>
        </div>
      ))}
    </div>
  );
}

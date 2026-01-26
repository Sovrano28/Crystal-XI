'use client';

import { useState } from 'react';
import { PlayerWithFixtures } from '@/types/fpl';
import { FDRBadge, PositionBadge, GameweekBadge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { formatPrice, getPositionShortName } from '@/lib/utils';

interface EnhancedGameweekGridProps {
  players: PlayerWithFixtures[];
  gameweeks: number[];
  dgwGameweeks?: number[];
  bgwGameweeks?: number[];
}

export function EnhancedGameweekGrid({
  players,
  gameweeks,
  dgwGameweeks = [],
  bgwGameweeks = [],
}: EnhancedGameweekGridProps) {
  // Group players by position
  const groupedPlayers = {
    gk: players.filter((p) => p.element_type === 1),
    def: players.filter((p) => p.element_type === 2),
    mid: players.filter((p) => p.element_type === 3),
    fwd: players.filter((p) => p.element_type === 4),
  };

  const positionLabels = {
    gk: 'Goalkeepers',
    def: 'Defenders',
    mid: 'Midfielders',
    fwd: 'Forwards',
  };

  return (
    <Card padding="none" className="overflow-hidden">
      {/* Header */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="bg-[var(--background-secondary)] border-b border-[var(--surface-border)]">
              <th className="sticky left-0 z-20 bg-[var(--background-secondary)] px-4 py-3 text-left">
                <span className="text-sm font-semibold text-[var(--foreground)]">Player</span>
              </th>
              {gameweeks.map((gw) => {
                const isDGW = dgwGameweeks.includes(gw);
                const isBGW = bgwGameweeks.includes(gw);
                return (
                  <th key={gw} className="px-2 py-3 text-center min-w-[60px]">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs text-[var(--foreground-muted)]">GW</span>
                      <span className="text-sm font-semibold text-[var(--foreground)]">{gw}</span>
                      {isDGW && <GameweekBadge type="dgw" size="sm" />}
                      {isBGW && <GameweekBadge type="bgw" size="sm" />}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedPlayers).map(([posKey, posPlayers]) => (
              <>
                {/* Position Header */}
                <tr key={posKey} className="bg-[var(--surface)]/50">
                  <td
                    colSpan={gameweeks.length + 1}
                    className="sticky left-0 z-10 px-4 py-2 text-sm font-semibold text-[var(--foreground-secondary)]"
                  >
                    {positionLabels[posKey as keyof typeof positionLabels]}
                  </td>
                </tr>

                {/* Players in this position */}
                {posPlayers.map((player, index) => (
                  <tr
                    key={player.id}
                    className={cn(
                      'border-b border-[var(--surface-border)]',
                      'transition-colors duration-150',
                      'hover:bg-[var(--surface)]/50'
                    )}
                  >
                    {/* Player Info - Sticky */}
                    <td className="sticky left-0 z-10 bg-[var(--background)] px-4 py-3">
                      <div className="flex items-center gap-3">
                        {/* Player Avatar */}
                        <div
                          className={cn(
                            'w-10 h-10 rounded-xl',
                            'bg-gradient-to-br from-[var(--pl-magenta)] to-[var(--pl-purple)]',
                            'flex items-center justify-center',
                            'text-white font-bold text-sm'
                          )}
                        >
                          {player.web_name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-[var(--foreground)]">
                              {player.web_name}
                            </span>
                            <PositionBadge position={player.element_type as 1 | 2 | 3 | 4} size="sm" />
                          </div>
                          <div className="text-xs text-[var(--foreground-muted)]">
                            {formatPrice(player.now_cost)}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Fixtures */}
                    {gameweeks.map((gw) => {
                      const fixtures = player.upcomingFixtures?.filter((f) => f.gameweek === gw) || [];
                      const hasDouble = fixtures.length > 1;
                      const hasBlank = fixtures.length === 0;

                      return (
                        <td key={gw} className="px-2 py-3">
                          <div className="flex flex-col items-center gap-1">
                            {hasBlank ? (
                              <div className="text-xs text-[var(--foreground-muted)]">-</div>
                            ) : (
                              fixtures.map((fixture, i) => (
                                <Tooltip
                                  key={i}
                                  content={
                                    <div>
                                      <p className="font-medium">
                                        {fixture.isHome ? 'vs' : '@'} {fixture.opponent.name}
                                      </p>
                                      <p className="text-xs opacity-70">
                                        FDR: {fixture.difficulty}
                                      </p>
                                    </div>
                                  }
                                >
                                  <div
                                    className={cn(
                                      'flex flex-col items-center gap-0.5 p-1.5 rounded-lg',
                                      'transition-all duration-200',
                                      'hover:scale-110 cursor-pointer'
                                    )}
                                  >
                                    <FDRBadge difficulty={fixture.difficulty} size="sm" />
                                    <span className="text-[10px] font-medium text-[var(--foreground-secondary)]">
                                      {fixture.opponent.short_name}
                                      <span className="text-[var(--foreground-muted)]">
                                        ({fixture.isHome ? 'H' : 'A'})
                                      </span>
                                    </span>
                                  </div>
                                </Tooltip>
                              ))
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// Squad FDR Heatmap
interface FDRHeatmapProps {
  players: PlayerWithFixtures[];
  gameweeks: number[];
}

export function FDRHeatmap({ players, gameweeks }: FDRHeatmapProps) {
  // Calculate average FDR per gameweek
  const averageFDR = gameweeks.map((gw) => {
    const fixtures = players.flatMap((p) =>
      (p.upcomingFixtures || []).filter((f) => f.gameweek === gw)
    );
    if (fixtures.length === 0) return 0;
    const total = fixtures.reduce((sum, f) => sum + f.difficulty, 0);
    return total / fixtures.length;
  });

  const getHeatmapColor = (fdr: number) => {
    if (fdr === 0) return 'bg-gray-300';
    if (fdr <= 1.5) return 'bg-[var(--fdr-1)]';
    if (fdr <= 2.5) return 'bg-[var(--fdr-2)]';
    if (fdr <= 3.5) return 'bg-[var(--fdr-3)]';
    if (fdr <= 4.5) return 'bg-[var(--fdr-4)]';
    return 'bg-[var(--fdr-5)]';
  };

  return (
    <Card padding="md">
      <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">
        Squad Fixture Difficulty
      </h3>
      <div className="flex gap-1 overflow-x-auto pb-2 hide-scrollbar">
        {gameweeks.map((gw, index) => (
          <Tooltip
            key={gw}
            content={
              <div>
                <p className="font-medium">GW {gw}</p>
                <p className="text-xs">Avg FDR: {averageFDR[index].toFixed(1)}</p>
              </div>
            }
          >
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'w-8 h-16 rounded-lg',
                  getHeatmapColor(averageFDR[index]),
                  'transition-transform duration-200 hover:scale-105'
                )}
              />
              <span className="text-[10px] text-[var(--foreground-muted)]">{gw}</span>
            </div>
          </Tooltip>
        ))}
      </div>
      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-[var(--foreground-muted)]">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-[var(--fdr-1)]" /> Easy
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-[var(--fdr-3)]" /> Medium
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-[var(--fdr-5)]" /> Hard
        </div>
      </div>
    </Card>
  );
}

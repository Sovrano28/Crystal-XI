'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useBootstrapData, useTeamData } from '@/hooks/useFPLData';
import { useUserTeam } from '@/hooks/useTeam';
import { useGameweeks } from '@/hooks/useGameweeks';
import { PitchView } from '@/components/planner/PitchView';
import { EnhancedGameweekGrid, FDRHeatmap } from '@/components/planner/GameweekGrid';
import { GameweekSlider, QuickJumpButtons, ViewToggle } from '@/components/planner/GameweekSlider';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SkeletonPlayerCard } from '@/components/ui/Skeleton';
import { PlayerWithFixtures } from '@/types/fpl';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function PlannerPage() {
  const { data: session } = useSession();
  const { fplTeamId, loading: teamLoading } = useUserTeam();
  const { data: bootstrap, loading: bootstrapLoading } = useBootstrapData();
  const { data: teamData, loading: teamDataLoading } = useTeamData(fplTeamId);
  const { currentGameweek, remainingGameweeks } = useGameweeks();
  
  const [players, setPlayers] = useState<PlayerWithFixtures[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // View state
  const [viewMode, setViewMode] = useState<'pitch' | 'grid'>('grid');
  const [selectedGameweeks, setSelectedGameweeks] = useState<number[]>([]);
  const [singleSelectedGW, setSingleSelectedGW] = useState<number>(currentGameweek || 1);

  // Initialize selected gameweeks
  useEffect(() => {
    if (remainingGameweeks.length > 0 && selectedGameweeks.length === 0) {
      const next5 = remainingGameweeks.slice(0, 5).map((gw) => gw.id);
      setSelectedGameweeks(next5);
      setSingleSelectedGW(next5[0] || currentGameweek || 1);
    }
  }, [remainingGameweeks, selectedGameweeks.length, currentGameweek]);

  useEffect(() => {
    async function loadPlayerFixtures() {
      if (!bootstrap || !teamData || !fplTeamId) {
        setLoading(false);
        return;
      }

      // Check if picks are available
      if (!teamData.picks || !Array.isArray(teamData.picks) || teamData.picks.length === 0) {
        setError('Team picks data is not available. Please try again later.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const playerIds = teamData.picks.map((pick) => pick.element);
        
        // Fetch players with fixtures through API route
        const response = await fetch('/api/fpl/players-fixtures', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ playerIds }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch players with fixtures');
        }

        const data = await response.json();
        setPlayers(data.players || []);
        setError(null);
      } catch (err) {
        console.error('Error loading player fixtures:', err);
        setError(err instanceof Error ? err.message : 'Failed to load player fixtures');
      } finally {
        setLoading(false);
      }
    }

    loadPlayerFixtures();
  }, [bootstrap, teamData, fplTeamId]);

  const allGameweeks = remainingGameweeks.map((gw) => gw.id);
  const isLoading = teamLoading || bootstrapLoading || teamDataLoading || loading;

  // No Team Connected State
  if (!isLoading && !fplTeamId) {
    return (
      <div className="max-w-7xl mx-auto">
        <Card className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[var(--pl-magenta)]/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-[var(--pl-magenta)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">No FPL Team Connected</h2>
            <p className="text-[var(--foreground-muted)] mb-6">
              Connect your FPL team to view fixtures across all gameweeks and plan your transfers.
            </p>
            <Link href="/dashboard/team">
              <Button variant="primary">Connect Your Team</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-[var(--surface)] rounded-lg animate-shimmer" />
            <div className="h-4 w-48 bg-[var(--surface)] rounded animate-shimmer" />
          </div>
          <div className="h-10 w-32 bg-[var(--surface)] rounded-xl animate-shimmer" />
        </div>
        <div className="h-16 bg-[var(--surface)] rounded-xl animate-shimmer" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonPlayerCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <Card className="text-center py-12 border-red-500/30">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-500/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">Something went wrong</h2>
            <p className="text-[var(--foreground-muted)] mb-6">{error}</p>
            <Button variant="primary" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // No Players State
  if (players.length === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <Card className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[var(--pl-cyan)]/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-[var(--pl-cyan)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">No Players Found</h2>
            <p className="text-[var(--foreground-muted)]">
              Unable to load your team players. Try refreshing the page.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">
            Multi-Gameweek Planner
          </h1>
          <p className="text-[var(--foreground-muted)] mt-1">
            View your team's fixtures across all remaining gameweeks
          </p>
        </div>
        <ViewToggle view={viewMode} onViewChange={setViewMode} />
      </div>

      {/* Quick Jump Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <span className="text-sm font-medium text-[var(--foreground-muted)]">Quick select:</span>
        <QuickJumpButtons
          currentGameweek={currentGameweek || 1}
          totalGameweeks={38}
          onQuickJump={setSelectedGameweeks}
        />
      </div>

      {/* Gameweek Slider */}
      <GameweekSlider
        gameweeks={allGameweeks}
        currentGameweek={currentGameweek || 1}
        selectedGameweeks={viewMode === 'pitch' ? [singleSelectedGW] : selectedGameweeks}
        onSelectionChange={(gws) => {
          if (viewMode === 'pitch') {
            setSingleSelectedGW(gws[0] || currentGameweek || 1);
          } else {
            setSelectedGameweeks(gws);
          }
        }}
        onSingleSelect={setSingleSelectedGW}
        mode={viewMode === 'pitch' ? 'single' : 'range'}
      />

      {/* FDR Heatmap */}
      <FDRHeatmap players={players} gameweeks={selectedGameweeks} />

      {/* Main View */}
      {viewMode === 'pitch' ? (
        <PitchView
          players={players}
          selectedGameweek={singleSelectedGW}
        />
      ) : (
        <EnhancedGameweekGrid
          players={players}
          gameweeks={selectedGameweeks}
        />
      )}
    </div>
  );
}

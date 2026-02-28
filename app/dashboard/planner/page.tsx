'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
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
import { useTransferPlans } from '@/hooks/useTransferPlans';

const PLANNER_LINEUP_KEY = (teamId: number) => `crystal-planner-lineup-${teamId}`;

function getSquadSignature(playerIds: number[]): string {
  return [...playerIds].sort((a, b) => a - b).join(',');
}

function loadSavedLineup(teamId: number): { squadSignature: string; playerIds: number[] } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PLANNER_LINEUP_KEY(teamId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { squadSignature: string; playerIds: number[] };
    if (parsed?.playerIds?.length === 15 && parsed?.squadSignature) return parsed;
  } catch {
    /* ignore */
  }
  return null;
}

function saveLineup(teamId: number, playerIds: number[]) {
  if (typeof window === 'undefined' || playerIds.length !== 15) return;
  const squadSignature = getSquadSignature(playerIds);
  try {
    localStorage.setItem(
      PLANNER_LINEUP_KEY(teamId),
      JSON.stringify({ squadSignature, playerIds })
    );
  } catch {
    /* ignore */
  }
}

function clearSavedLineup(teamId: number) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(PLANNER_LINEUP_KEY(teamId));
  } catch {
    /* ignore */
  }
}

export default function PlannerPage() {
  const { data: session } = useSession();
  const { fplTeamId, loading: teamLoading } = useUserTeam();
  const { data: bootstrap, loading: bootstrapLoading } = useBootstrapData();
  // Use 'planner' mode to fetch current squad (next GW picks)
  const { data: teamData, loading: teamDataLoading, refetch: refetchTeam } = useTeamData(fplTeamId, 'planner');
  const { planningGameweek, remainingGameweeks } = useGameweeks();
  
  const [players, setPlayers] = useState<PlayerWithFixtures[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Player selling prices (from API calculation using transfer history)
  const [playerPrices, setPlayerPrices] = useState<Map<number, number>>(new Map());
  
  // View state
  const [viewMode, setViewMode] = useState<'pitch' | 'grid'>('grid');
  const [selectedGameweeks, setSelectedGameweeks] = useState<number[]>([]);
  const [singleSelectedGW, setSingleSelectedGW] = useState<number>(planningGameweek || 1);

  // Initialize selected gameweeks
  useEffect(() => {
    if (remainingGameweeks.length > 0 && selectedGameweeks.length === 0) {
      const next5 = remainingGameweeks.slice(0, 5).map((gw) => gw.id);
      setSelectedGameweeks(next5);
      setSingleSelectedGW(next5[0] || planningGameweek || 1);
    }
  }, [remainingGameweeks, selectedGameweeks.length, planningGameweek]);
  
  // Interactive State
  const [captainId, setCaptainId] = useState<number | undefined>(undefined);
  const [viceCaptainId, setViceCaptainId] = useState<number | undefined>(undefined);
  const [substitutionMode, setSubstitutionMode] = useState<number | null>(null);
  const [captainSettingsLoaded, setCaptainSettingsLoaded] = useState(false);

  // Load captain settings from DB or fall back to FPL picks
  useEffect(() => {
    async function loadCaptainSettings() {
      if (!planningGameweek || !teamData?.picks || captainSettingsLoaded) return;
      
      try {
        // Try to load saved settings from DB
        const response = await fetch(`/api/team/captain?gameweek=${planningGameweek}`);
        if (response.ok) {
          const data = await response.json();
          
          // If we have saved settings that weren't just fetched from FPL, use them
          if (data.settings && !data.settings.lastFetchedFromFPL) {
            setCaptainId(data.settings.captainId);
            setViceCaptainId(data.settings.viceCaptainId);
            setCaptainSettingsLoaded(true);
            return;
          }
        }
        
        // Fall back to FPL picks data
        const captain = teamData.picks.find(p => p.is_captain);
        const vice = teamData.picks.find(p => p.is_vice_captain);
        if (captain) setCaptainId(captain.element);
        if (vice) setViceCaptainId(vice.element);
        
        // Save FPL defaults to DB for this gameweek
        if (captain && vice) {
          await fetch('/api/team/captain', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              gameweek: planningGameweek,
              captainId: captain.element,
              viceCaptainId: vice.element,
              fromFPL: true, // Mark as fetched from FPL
            }),
          });
        }
        
        setCaptainSettingsLoaded(true);
      } catch (error) {
        console.error('Error loading captain settings:', error);
        // Fall back to FPL picks on error
        const captain = teamData.picks.find(p => p.is_captain);
        const vice = teamData.picks.find(p => p.is_vice_captain);
        if (captain) setCaptainId(captain.element);
        if (vice) setViceCaptainId(vice.element);
        setCaptainSettingsLoaded(true);
      }
    }
    
    loadCaptainSettings();
  }, [teamData, planningGameweek, captainSettingsLoaded]);

  // Save captain settings to DB when changed by user
  const saveCaptainSettings = async (newCaptainId: number, newViceCaptainId: number) => {
    if (!planningGameweek) return;
    
    try {
      await fetch('/api/team/captain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameweek: planningGameweek,
          captainId: newCaptainId,
          viceCaptainId: newViceCaptainId,
          fromFPL: false, // Mark as user-modified
        }),
      });
    } catch (error) {
      console.error('Error saving captain settings:', error);
    }
  };

  // Handle Captain Change - now persists to DB
  const handleCaptainChange = (playerId: number, isCaptain: boolean) => {
    let newCaptainId = captainId;
    let newViceCaptainId = viceCaptainId;
    
    if (isCaptain) {
      // If promoting Vice to Captain, swap them
      if (playerId === viceCaptainId) {
        newViceCaptainId = captainId;
      }
      newCaptainId = playerId;
      setCaptainId(newCaptainId);
      if (playerId === viceCaptainId) setViceCaptainId(newViceCaptainId);
    } else {
      // Setting as Vice-Captain
      if (playerId === captainId) {
        newCaptainId = viceCaptainId;
      }
      newViceCaptainId = playerId;
      setViceCaptainId(newViceCaptainId);
      if (playerId === captainId) setCaptainId(newCaptainId);
    }
    
    // Save to DB if both are set
    if (newCaptainId && newViceCaptainId) {
      saveCaptainSettings(newCaptainId, newViceCaptainId);
    }
  };

  // Handle Refresh Team Data & Transfer Plans
  const handleRefresh = async () => {
    setIsRefreshing(true);
    refetchTeam();
    await refreshPlans();
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  // Handle Substitution Logic
  const handleSubstitute = (playerId: number) => {
    // If no player selected, select this one
    if (substitutionMode === null) {
      setSubstitutionMode(playerId);
      return;
    }

    // If clicking same player, deselect
    if (substitutionMode === playerId) {
      setSubstitutionMode(null);
      return;
    }

    // Perform substitution
    const newPlayers = [...players];
    const player1Index = newPlayers.findIndex(p => p.id === substitutionMode);
    const player2Index = newPlayers.findIndex(p => p.id === playerId);

    if (player1Index === -1 || player2Index === -1) {
       setSubstitutionMode(null);
       return;
    }

    // Swap players in the array
    const temp = newPlayers[player1Index];
    newPlayers[player1Index] = newPlayers[player2Index];
    newPlayers[player2Index] = temp;

    // Validate Formation
    if (isValidFormation(newPlayers)) {
      setPlayers(newPlayers);
      if (fplTeamId) saveLineup(fplTeamId, newPlayers.map((p) => p.id));
    } else {
      // Warn user (could use a toast here)
      alert("Invalid formation! You need 1 GK, at least 3 DEFs, and at least 1 FWD.");
    }

    setSubstitutionMode(null);
  };

  const handleResetLineup = () => {
    if (lastServerSquadRef.current.length === 15) {
      setPlayers(lastServerSquadRef.current);
      if (fplTeamId) clearSavedLineup(fplTeamId);
    }
  };

  // Formation Validator
  const isValidFormation = (newLineup: PlayerWithFixtures[]) => {
    const starters = newLineup.slice(0, 11);
    const gk = starters.filter(p => p.element_type === 1).length;
    const def = starters.filter(p => p.element_type === 2).length;
    const fwd = starters.filter(p => p.element_type === 4).length;

    return gk === 1 && def >= 3 && fwd >= 1;
  };

  // Transfer Plans (manual refresh only - no polling)
  const { activePlan, refreshPlans } = useTransferPlans();

  // Keep last server-computed squad for Reset to default
  const lastServerSquadRef = useRef<PlayerWithFixtures[]>([]);

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
        // Only show loading skeleton on initial load - prevents "blink" when effect re-runs
        // (e.g. from useTransferPlans 30s poll updating activePlan reference)
        if (players.length === 0) setLoading(true);
        // Base squad IDs
        const baseIds = teamData.picks.map((pick) => pick.element);
        
        // Include planned players if active plan exists
        const plannedIds = activePlan ? activePlan.transfers.map(t => t.playerIn) : [];
        const uniqueIds = Array.from(new Set([...baseIds, ...plannedIds]));
        
        // Fetch players with fixtures through API route
        const response = await fetch('/api/fpl/players-fixtures', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ playerIds: uniqueIds }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch players with fixtures');
        }

        const data = await response.json();
        const allFetchedPlayers: PlayerWithFixtures[] = data.players || [];
        
        // Construct the Base Squad (Current Team)
        // We map using the baseIds order to maintain position
        const currentSquad = baseIds.map(id => allFetchedPlayers.find(p => p.id === id)).filter(Boolean) as PlayerWithFixtures[];
        
        // Construct the Planned Squad (if active plan)
        // This is what we will display if condition is met
        let finalSquad = currentSquad;
        
        if (activePlan) {
            // Apply transfers to create planned squad
            // We clone to avoid mutating currentSquad
            const plannedSquad = [...currentSquad];
            
            activePlan.transfers.forEach(t => {
                const idx = plannedSquad.findIndex(p => p.id === t.playerOut);
                if (idx !== -1) {
                    const playerIn = allFetchedPlayers.find(p => p.id === t.playerIn);
                    if (playerIn) {
                        plannedSquad[idx] = playerIn;
                    }
                }
            });
            
            // Only use planned squad if we are looking at or after the plan's gameweek
            // But wait, loadPlayerFixtures updates state once. 
            // We should store activePlan logic in the state or separate effect?
            // Actually, simply storing the "Effective Squad" in 'players' state is easiest for now.
            // But if user switches GW back and forth, we want to toggle squads.
            // So we really should store 'currentSquad' and 'plannedSquad' separately?
            // Or just store 'allFetchedPlayers' and derive in render?
            // 'PitchView' and 'Grid' expect a list of 15 players.
            // Let's stick to: Store the 'Effective Squad' based on current view.
            // But 'loadPlayerFixtures' is dependent on [bootstrap, teamData]. Not selectedGW.
            // So we should just save the *Planned Squad* as the primary state if active plan exists.
            // Logic: "Active Plan" overrides reality.
            // If user wants to see old team, they can deactivate plan?
            // Or we check GW inside this effect?
            // This effect doesn't depend on selectedGW!
            // Let's just set 'players' to 'plannedSquad' if activePlan exists.
            
            finalSquad = plannedSquad;
        }

        // Always keep ref for Reset to default
        lastServerSquadRef.current = finalSquad;

        const squadSignature = getSquadSignature(finalSquad.map((p) => p.id));
        const saved = fplTeamId ? loadSavedLineup(fplTeamId) : null;

        // Apply saved lineup from localStorage if squad matches
        let squadToSet = finalSquad;
        if (
          saved &&
          saved.squadSignature === squadSignature &&
          saved.playerIds.length === 15
        ) {
          const idToPlayer = new Map(finalSquad.map((p) => [p.id, p]));
          const reordered = saved.playerIds
            .map((id) => idToPlayer.get(id))
            .filter(Boolean) as PlayerWithFixtures[];
          if (reordered.length === 15) squadToSet = reordered;
        } else {
          // Preserve in-memory order when effect re-runs but squad unchanged
          const currentIds = new Set(players.map((p) => p.id));
          const newIds = new Set(finalSquad.map((p) => p.id));
          const samePlayerSet =
            players.length === 15 &&
            finalSquad.length === 15 &&
            currentIds.size === newIds.size &&
            [...currentIds].every((id) => newIds.has(id));
          if (samePlayerSet) squadToSet = players; // keep user's current order
        }

        setPlayers(squadToSet);

        // Extract player selling prices from teamData.playerPriceBreakdown
        const pricesMap = new Map<number, number>();
        const breakdown = (teamData as any).playerPriceBreakdown || [];
        for (const item of breakdown) {
          if (item.playerId > 0 && item.sellingPrice !== undefined) {
            pricesMap.set(item.playerId, item.sellingPrice);
          }
        }
        setPlayerPrices(pricesMap);
        
        setError(null);
      } catch (err) {
        console.error('Error loading player fixtures:', err);
        setError(err instanceof Error ? err.message : 'Failed to load player fixtures');
      } finally {
        setLoading(false);
      }
    }

    loadPlayerFixtures();
  }, [bootstrap, teamData, fplTeamId, activePlan]);

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
            View your team&apos;s fixtures across all remaining gameweeks
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {viewMode === 'pitch' && (
            <Button
              onClick={handleResetLineup}
              variant="outline"
              size="sm"
              title="Reset to default lineup"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                />
              </svg>
              Reset lineup
            </Button>
          )}
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={isRefreshing || teamDataLoading}
            title="Refresh team data and transfer plans"
          >
            <svg
              className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <ViewToggle view={viewMode} onViewChange={setViewMode} />
        </div>
      </div>

      {/* Active Plan Indicator */}
      {activePlan && (
        <div className="bg-[var(--pl-cyan)]/10 border border-[var(--pl-cyan)]/30 rounded-lg p-3 flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--pl-cyan)]/20 flex items-center justify-center text-[var(--pl-cyan)]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-[var(--foreground)]">
                        Viewing Active Plan: <span className="text-[var(--pl-cyan)]">{activePlan.name}</span>
                    </h3>
                    <p className="text-xs text-[var(--foreground-muted)]">
                        Your squad reflects planned transfers for GW{activePlan.gameweek}.
                    </p>
                </div>
            </div>
            <Link href="/dashboard/transfers">
                <Button size="sm" variant="outline">Manage Plan</Button>
            </Link>
        </div>
      )}

      {/* Gameweek Slider */}
      <div className="space-y-4">
        <GameweekSlider
          gameweeks={allGameweeks}
          currentGameweek={planningGameweek || 1}
          selectedGameweeks={viewMode === 'pitch' ? [singleSelectedGW] : selectedGameweeks}
          onSelectionChange={(gws) => {
            if (viewMode === 'pitch') {
              setSingleSelectedGW(gws[0] || planningGameweek || 1);
            } else {
              setSelectedGameweeks(gws);
            }
          }}
          onSingleSelect={setSingleSelectedGW}
          mode={viewMode === 'pitch' ? 'single' : 'range'}
        />

        {/* Quick Jump Buttons - Moved closer to the view */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-center gap-4">
          <span className="text-sm font-medium text-[var(--foreground-muted)]">Quick select:</span>
          <QuickJumpButtons
            currentGameweek={planningGameweek || 1}
            totalGameweeks={38}
            onQuickJump={setSelectedGameweeks}
          />
        </div>
      </div>

      {/* Main View */}
      {viewMode === 'pitch' ? (
        <PitchView
          players={players}
          teams={bootstrap?.teams || []}
          selectedGameweek={singleSelectedGW}
          captainId={captainId}
          viceCaptainId={viceCaptainId}
          onCaptainChange={handleCaptainChange}
          substitutionMode={substitutionMode}
          onSubstitute={handleSubstitute}
          showNavigation={true}
          onPrevWeek={() => {
            const currentIdx = remainingGameweeks.findIndex(gw => gw.id === singleSelectedGW);
            if (currentIdx > 0) {
              const prevGW = remainingGameweeks[currentIdx - 1].id;
              setSingleSelectedGW(prevGW);
              setSelectedGameweeks([prevGW]);
            }
          }}
          onNextWeek={() => {
            const currentIdx = remainingGameweeks.findIndex(gw => gw.id === singleSelectedGW);
            if (currentIdx < remainingGameweeks.length - 1) {
              const nextGW = remainingGameweeks[currentIdx + 1].id;
              setSingleSelectedGW(nextGW);
              setSelectedGameweeks([nextGW]);
            }
          }}
          canGoPrev={remainingGameweeks.findIndex(gw => gw.id === singleSelectedGW) > 0}
          canGoNext={remainingGameweeks.findIndex(gw => gw.id === singleSelectedGW) < remainingGameweeks.length - 1}
          playerPrices={playerPrices}
        />
      ) : (
        <EnhancedGameweekGrid
          players={players}
          gameweeks={selectedGameweeks}
          playerPrices={playerPrices}
        />
      )}
    </div>
  );
}

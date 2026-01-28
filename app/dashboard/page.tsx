'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useUserTeam } from '@/hooks/useTeam';
import { useBootstrapData, useTeamData } from '@/hooks/useFPLData';
import { useGameweeks } from '@/hooks/useGameweeks';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { SkeletonStatsCard } from '@/components/ui/Skeleton';
import { PointsPitchView } from '@/components/dashboard/PointsPitchView';
import { PlayerWithPoints } from '@/types/fpl';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { data: session } = useSession();
  const { fplTeamId, loading: teamLoading } = useUserTeam();
  const { data: bootstrap, loading: bootstrapLoading } = useBootstrapData();
  const { data: teamData, loading: teamDataLoading } = useTeamData(fplTeamId);
  const { scoringGameweek, planningGameweek } = useGameweeks();

  const [playersWithPoints, setPlayersWithPoints] = useState<PlayerWithPoints[]>([]);
  const [pointsLoading, setPointsLoading] = useState(false);
  const [pointsError, setPointsError] = useState<string | null>(null);

  const isLoading = teamLoading || bootstrapLoading || teamDataLoading;

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Fetch player points for scoring gameweek
  useEffect(() => {
    async function loadPlayerPoints() {
      if (!bootstrap || !teamData || !fplTeamId || !scoringGameweek) {
        return;
      }

      // Check if picks are available
      if (!teamData.picks || !Array.isArray(teamData.picks) || teamData.picks.length === 0) {
        return;
      }

      try {
        setPointsLoading(true);
        setPointsError(null);
        const playerIds = teamData.picks.map((pick) => pick.element);
        
        // Fetch players with points through API route
        const response = await fetch('/api/fpl/player-points', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ playerIds, gameweek: scoringGameweek }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch player points');
        }

        const data = await response.json();

        
        // Merge captaincy data from picks
        const enhancedPlayers = (data.players || []).map((player: PlayerWithPoints) => {
          const pick = teamData.picks.find((p) => p.element === player.id);
          if (pick) {
            return {
              ...player,
              is_captain: pick.is_captain,
              is_vice_captain: pick.is_vice_captain,
            };
          }
          return player;
        });

        setPlayersWithPoints(enhancedPlayers);
      } catch (err) {
        console.error('Error loading player points:', err);
        setPointsError(err instanceof Error ? err.message : 'Failed to load player points');
      } finally {
        setPointsLoading(false);
      }
    }

    loadPlayerPoints();
  }, [bootstrap, teamData, fplTeamId, scoringGameweek]);

  const totalPoints = teamData?.entry_history?.total_points || 0;
  const currentBank = teamData?.entry_history?.bank || 0;
  const teamValue = teamData?.entry_history?.value || 0;
  const overallRank = teamData?.entry_history?.overall_rank || 0;

  // Calculate total gameweek points from starting XI (first 11 players)
  const calculateGWPoints = (): number => {
    if (playersWithPoints.length === 0) return 0;
    
    const startingXI = playersWithPoints.slice(0, 11);
    const captain = startingXI.find(p => p.is_captain);
    const viceCaptain = startingXI.find(p => p.is_vice_captain);
    
    // Check if captain played (has minutes > 0)
    const captainPlayed = captain?.gameweekPoints?.minutes && captain.gameweekPoints.minutes > 0;
    
    return startingXI.reduce((total, player) => {
      const basePoints = player.gameweekPoints?.total_points || 0;
      
      // Captain gets 2x points
      if (player.is_captain) {
        return total + (basePoints * 2);
      }
      
      // Vice-captain gets 2x only if captain didn't play
      if (player.is_vice_captain && !captainPlayed) {
        return total + (basePoints * 2);
      }
      
      return total + basePoints;
    }, 0);
  };

  const gameweekPoints = calculateGWPoints();

  const stats = [
    {
      label: `GW${scoringGameweek} Points`,
      value: gameweekPoints.toString(),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      gradient: 'from-yellow-500 to-amber-500',
    },
    {
      label: 'Total Points',
      value: totalPoints.toLocaleString(),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      label: 'Team Value',
      value: `£${(teamValue / 10).toFixed(1)}m`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Bank',
      value: `£${(currentBank / 10).toFixed(1)}m`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      label: 'Current GW',
      value: scoringGameweek?.toString() || '-',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      gradient: 'from-orange-500 to-red-500',
    },
  ];

  const quickActions = [
    {
      label: 'View Planner',
      description: 'See fixtures across all gameweeks',
      href: '/dashboard/planner',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      label: 'Plan Transfers',
      description: 'Simulate transfer decisions',
      href: '/dashboard/transfers',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
    },
    {
      label: 'Compare Players',
      description: 'Side-by-side player comparison',
      href: '/dashboard/compare',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">
          {getGreeting()}, Manager! 👋
        </h1>
        <p className="text-[var(--foreground-muted)] mt-1">
          Here's how your FPL team is performing
        </p>
      </div>

      {/* Connect Team Alert */}
      {!fplTeamId && !isLoading && (
        <Card className="border-[var(--pl-cyan)]/30 bg-[var(--pl-cyan)]/5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-[var(--pl-cyan)]/20 text-[var(--pl-cyan)]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-[var(--foreground)]">Connect Your FPL Team</h3>
                <p className="text-sm text-[var(--foreground-muted)]">
                  Enter your FPL team ID to sync your squad and view the multi-gameweek planner.
                </p>
              </div>
            </div>
            <Link href="/dashboard/team">
              <Button variant="glow">
                Connect Team
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonStatsCard key={i} />)
          : stats.map((stat, index) => (
              <Card
                key={stat.label}
                variant="default"
                padding="md"
                className={cn('animate-fade-in-up')}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-[var(--foreground-muted)]">{stat.label}</p>
                    <p className="text-2xl lg:text-3xl font-bold text-[var(--foreground)] mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={cn(
                      'p-2.5 rounded-xl',
                      'bg-gradient-to-br',
                      stat.gradient,
                      'text-white'
                    )}
                  >
                    {stat.icon}
                  </div>
                </div>
              </Card>
            ))}
      </div>

      {/* Quick Actions */}
      {fplTeamId && (
        <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Link key={action.href} href={action.href}>
                <Card
                  variant="interactive"
                  padding="md"
                  className={cn('h-full animate-fade-in-up')}
                  style={{ animationDelay: `${(index + 4) * 100}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-[var(--pl-magenta)]/10 text-[var(--pl-magenta)]">
                      {action.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-[var(--foreground)]">{action.label}</h3>
                      <p className="text-sm text-[var(--foreground-muted)] mt-0.5">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Current Gameweek Points Section */}
      {fplTeamId && scoringGameweek && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                Gameweek {scoringGameweek} Points
              </h2>
              <p className="text-sm text-[var(--foreground-muted)] mt-1">
                Points scored by your players in the current gameweek
              </p>
            </div>
          </div>

          {pointsLoading ? (
            <Card padding="md">
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-[var(--pl-magenta)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-sm text-[var(--foreground-muted)]">Loading player points...</p>
                </div>
              </div>
            </Card>
          ) : pointsError ? (
            <Card padding="md" className="border-red-500/30">
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <p className="text-sm text-red-500">{pointsError}</p>
                <Button
                  variant="primary"
                  size="sm"
                  className="mt-4"
                  onClick={() => {
                    setPointsError(null);
                    // Trigger reload by updating a dependency
                    if (teamData && fplTeamId && scoringGameweek) {
                      const playerIds = teamData.picks.map((pick) => pick.element);
                      fetch('/api/fpl/player-points', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ playerIds, gameweek: scoringGameweek }),
                      })
                        .then((res) => res.json())
                        .then((data) => setPlayersWithPoints(data.players || []))
                        .catch((err) => setPointsError(err.message));
                    }
                  }}
                >
                  Try Again
                </Button>
              </div>
            </Card>
          ) : playersWithPoints.length > 0 ? (
            <Card padding="none" className="overflow-hidden">
              <PointsPitchView
                players={playersWithPoints}
                teams={bootstrap?.teams || []}
                gameweek={scoringGameweek}
              />
            </Card>
          ) : (
            <Card padding="md">
              <div className="text-center py-8">
                <p className="text-sm text-[var(--foreground-muted)]">
                  No player points data available for Gameweek {scoringGameweek}
                </p>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Overall Rank Card */}
      {fplTeamId && overallRank > 0 && (
        <Card glow glowColor="magenta" className="animate-fade-in-up" style={{ animationDelay: '700ms' }}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-[var(--foreground-muted)]">Overall Rank</p>
              <p className="text-3xl md:text-4xl font-bold text-gradient-magenta">
                #{overallRank.toLocaleString()}
              </p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-[var(--foreground-muted)]">
                Top {((overallRank / 10000000) * 100).toFixed(2)}% worldwide
              </p>
              <div className="mt-2 flex items-center justify-center md:justify-end gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Climbing
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

'use client';

import { useSession } from 'next-auth/react';
import { useUserTeam } from '@/hooks/useTeam';
import { useBootstrapData, useTeamData } from '@/hooks/useFPLData';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { SkeletonStatsCard } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { data: session } = useSession();
  const { fplTeamId, loading: teamLoading } = useUserTeam();
  const { data: bootstrap, loading: bootstrapLoading } = useBootstrapData();
  const { data: teamData, loading: teamDataLoading } = useTeamData(fplTeamId);

  const isLoading = teamLoading || bootstrapLoading || teamDataLoading;

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const currentGameweek = bootstrap?.events.find((e) => e.is_current);
  const totalPoints = teamData?.entry_history?.total_points || 0;
  const currentBank = teamData?.entry_history?.bank || 0;
  const teamValue = teamData?.entry_history?.value || 0;
  const overallRank = teamData?.entry_history?.overall_rank || 0;

  const stats = [
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
      value: currentGameweek?.id?.toString() || '-',
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

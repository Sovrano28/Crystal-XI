'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { FDRBadge } from '@/components/ui/Badge';
import Link from 'next/link';

export function HeroSection() {
  // Sample player data for the floating cards
  const samplePlayers = [
    { name: 'Salah', team: 'LIV', fixtures: [2, 3, 1, 4, 2] },
    { name: 'Haaland', team: 'MCI', fixtures: [3, 2, 2, 1, 3] },
    { name: 'Saka', team: 'ARS', fixtures: [1, 2, 4, 3, 2] },
  ];

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-mesh" />
      
      {/* Animated gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[var(--pl-magenta)] rounded-full opacity-20 blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[var(--pl-cyan)] rounded-full opacity-15 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--pl-purple)] rounded-full opacity-10 blur-[120px]" />

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Column - Text Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--surface)] border border-[var(--surface-border)] mb-6 animate-fade-in-up">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--pl-cyan)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--pl-cyan)]"></span>
              </span>
              <span className="text-sm font-medium text-[var(--foreground-secondary)]">
                Now tracking GW 20 - GW 38
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in-up stagger-1">
              Plan Your{' '}
              <span className="text-gradient">FPL Team</span>
              <br />
              Across All Gameweeks
            </h1>

            <p className="text-lg md:text-xl text-[var(--foreground-secondary)] mb-8 max-w-xl mx-auto lg:mx-0 animate-fade-in-up stagger-2">
              View fixture difficulties, plan transfers, and make smarter decisions with our 
              multi-gameweek planner. Never miss a good fixture run again.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start animate-fade-in-up stagger-3">
              <Link href="/register">
                <Button size="lg" variant="primary" className="w-full sm:w-auto">
                  Get Started Free
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  See Features
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center lg:justify-start gap-8 mt-12 animate-fade-in-up stagger-4">
              <div>
                <div className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">10K+</div>
                <div className="text-sm text-[var(--foreground-muted)]">FPL Managers</div>
              </div>
              <div className="w-px h-12 bg-[var(--surface-border)]" />
              <div>
                <div className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">38</div>
                <div className="text-sm text-[var(--foreground-muted)]">Gameweeks</div>
              </div>
              <div className="w-px h-12 bg-[var(--surface-border)]" />
              <div>
                <div className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">100%</div>
                <div className="text-sm text-[var(--foreground-muted)]">Free</div>
              </div>
            </div>
          </div>

          {/* Right Column - Floating Preview Cards */}
          <div className="relative hidden lg:block">
            {/* Main Preview Card */}
            <div className="glass-card p-6 animate-float">
              <h3 className="font-semibold text-[var(--foreground)] mb-4">Multi-Gameweek Planner</h3>
              <div className="space-y-3">
                {samplePlayers.map((player, index) => (
                  <div
                    key={player.name}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-xl',
                      'bg-[var(--surface)] border border-[var(--surface-border)]',
                      'animate-slide-in-right'
                    )}
                    style={{ animationDelay: `${index * 100 + 400}ms` }}
                  >
                    {/* Player Avatar Placeholder */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--pl-magenta)] to-[var(--pl-purple)] flex items-center justify-center text-white font-bold text-sm">
                      {player.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-[var(--foreground)]">{player.name}</div>
                      <div className="text-xs text-[var(--foreground-muted)]">{player.team}</div>
                    </div>
                    {/* FDR Indicators */}
                    <div className="flex gap-1">
                      {player.fixtures.map((fdr, i) => (
                        <FDRBadge key={i} difficulty={fdr} size="sm" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating Badge - DGW Alert */}
            <div
              className={cn(
                'absolute -top-4 -right-4',
                'px-4 py-2 rounded-xl',
                'bg-gradient-to-r from-amber-400 to-amber-500',
                'text-amber-900 font-bold text-sm',
                'shadow-lg shadow-amber-500/30',
                'animate-float'
              )}
              style={{ animationDelay: '0.5s' }}
            >
              🎯 DGW Alert: GW 34
            </div>

            {/* Floating Badge - Easy Run */}
            <div
              className={cn(
                'absolute -bottom-4 -left-8',
                'px-4 py-2 rounded-xl',
                'bg-[var(--surface)] backdrop-blur-xl',
                'border border-[var(--surface-border)]',
                'shadow-[var(--shadow-lg)]',
                'animate-float'
              )}
              style={{ animationDelay: '1s' }}
            >
              <div className="flex items-center gap-2">
                <span className="text-[var(--pl-cyan)]">✨</span>
                <span className="text-sm font-medium text-[var(--foreground)]">Arsenal: Easy fixtures ahead!</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <a href="#features" className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </a>
      </div>
    </section>
  );
}

'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export default function TransfersPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">
          Transfer Planner
        </h1>
        <p className="text-[var(--foreground-muted)] mt-1">
          Plan your future transfers and see fixture impact
        </p>
      </div>

      {/* Coming Soon Card */}
      <Card className="text-center py-16">
        <div className="max-w-md mx-auto">
          {/* Icon */}
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[var(--pl-magenta)] to-[var(--pl-purple)] opacity-20 blur-xl animate-pulse" />
            <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-[var(--pl-magenta)] to-[var(--pl-purple)] flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
          </div>

          <span className="inline-block px-3 py-1 rounded-full bg-[var(--pl-cyan)]/10 text-[var(--pl-cyan)] text-sm font-medium mb-4 animate-pulse">
            Coming Soon
          </span>

          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">
            Transfer Planner
          </h2>
          
          <p className="text-[var(--foreground-muted)] mb-8 leading-relaxed">
            Plan your transfers for future gameweeks. Search for players, compare fixtures, 
            and see how transfers impact your team's fixture difficulty rating.
          </p>

          {/* Features Preview */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {[
              { icon: '🔍', label: 'Player Search' },
              { icon: '📊', label: 'FDR Comparison' },
              { icon: '💰', label: 'Budget Tracking' },
              { icon: '📅', label: 'Future GW Planning' },
            ].map((feature) => (
              <div
                key={feature.label}
                className={cn(
                  'p-3 rounded-xl',
                  'bg-[var(--surface)] border border-[var(--surface-border)]',
                  'text-sm text-[var(--foreground-secondary)]'
                )}
              >
                <span className="mr-2">{feature.icon}</span>
                {feature.label}
              </div>
            ))}
          </div>

          <Button variant="secondary" disabled>
            Notify Me When Ready
          </Button>
        </div>
      </Card>
    </div>
  );
}

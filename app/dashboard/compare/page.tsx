'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export default function ComparePage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">
          Player Comparison
        </h1>
        <p className="text-[var(--foreground-muted)] mt-1">
          Compare players side-by-side with stats and fixtures
        </p>
      </div>

      {/* Coming Soon Card */}
      <Card className="text-center py-16">
        <div className="max-w-md mx-auto">
          {/* Icon */}
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[var(--pl-cyan)] to-green-500 opacity-20 blur-xl animate-pulse" />
            <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-[var(--pl-cyan)] to-green-500 flex items-center justify-center">
              <svg className="w-12 h-12 text-[var(--pl-purple-dark)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>

          <span className="inline-block px-3 py-1 rounded-full bg-[var(--pl-cyan)]/10 text-[var(--pl-cyan)] text-sm font-medium mb-4 animate-pulse">
            Coming Soon
          </span>

          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">
            Player Comparison Tool
          </h2>
          
          <p className="text-[var(--foreground-muted)] mb-8 leading-relaxed">
            Compare any two players side-by-side. View stats, form, price changes, 
            and fixture difficulty to make informed transfer decisions.
          </p>

          {/* Features Preview */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {[
              { icon: '📈', label: 'Stats Comparison' },
              { icon: '🎯', label: 'Form Analysis' },
              { icon: '📅', label: 'Fixture Comparison' },
              { icon: '💹', label: 'Price Trends' },
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

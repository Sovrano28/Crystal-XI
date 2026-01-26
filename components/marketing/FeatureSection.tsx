'use client';

import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/Card';

const features = [
  {
    title: 'Multi-Gameweek View',
    description: "See your team's fixtures across ALL remaining gameweeks, not just the next one. Plan ahead like a pro.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    title: 'Fixture Difficulty Ratings',
    description: 'Color-coded FDR indicators (1-5 scale) help you identify easy fixture runs at a glance.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    title: 'Pitch View Mode',
    description: 'Visualize your team in a football formation with fixture badges on each player position.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    title: 'Transfer Planner',
    description: 'Plan future transfers and see how they impact your fixture difficulty across gameweeks.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
    gradient: 'from-orange-500 to-red-500',
  },
  {
    title: 'DGW & BGW Alerts',
    description: 'Automatic detection of Double and Blank gameweeks with visual indicators.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    gradient: 'from-yellow-500 to-amber-500',
  },
  {
    title: 'Captain Suggestions',
    description: 'Smart captain picks based on fixture difficulty, form, and historical data.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    gradient: 'from-[var(--pl-magenta)] to-[var(--pl-purple)]',
  },
];

export function FeatureSection() {
  return (
    <section id="features" className="py-24 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-mesh opacity-50" />
      
      <div className="container relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[var(--pl-magenta)]/10 text-[var(--pl-magenta)] text-sm font-medium mb-4">
            Features
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need to{' '}
            <span className="text-gradient">Dominate FPL</span>
          </h2>
          <p className="text-lg text-[var(--foreground-secondary)]">
            Make informed decisions with powerful tools designed for serious FPL managers.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              variant="interactive"
              padding="lg"
              className={cn(
                'group',
                'animate-fade-in-up'
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div
                className={cn(
                  'w-12 h-12 rounded-xl mb-4',
                  'flex items-center justify-center',
                  'bg-gradient-to-br',
                  feature.gradient,
                  'text-white',
                  'group-hover:scale-110 transition-transform duration-300'
                )}
              >
                {feature.icon}
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                {feature.title}
              </h3>
              <p className="text-[var(--foreground-muted)] text-sm leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// How It Works Section
export function HowItWorksSection() {
  const steps = [
    {
      step: '01',
      title: 'Connect Your Team',
      description: 'Enter your FPL team ID and we\'ll automatically sync your current squad.',
    },
    {
      step: '02',
      title: 'View Fixtures',
      description: 'See color-coded fixture difficulty for each player across all remaining gameweeks.',
    },
    {
      step: '03',
      title: 'Plan Transfers',
      description: 'Simulate transfers to see how they impact your team\'s fixture profile.',
    },
    {
      step: '04',
      title: 'Dominate Your Mini-League',
      description: 'Make smarter decisions and climb the rankings with data-driven insights.',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-[var(--background-secondary)]">
      <div className="container">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[var(--pl-cyan)]/10 text-[var(--pl-cyan)] text-sm font-medium mb-4">
            How It Works
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Get Started in{' '}
            <span className="text-[var(--pl-cyan)]">4 Easy Steps</span>
          </h2>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={step.step}
              className={cn(
                'relative',
                'animate-fade-in-up'
              )}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-[var(--surface-border)] to-transparent" />
              )}
              
              {/* Step Number */}
              <div className="relative z-10 w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[var(--pl-magenta)] to-[var(--pl-purple)] flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-[var(--pl-magenta)]/30">
                {step.step}
              </div>

              {/* Content */}
              <div className="text-center">
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-[var(--foreground-muted)]">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// CTA Section
export function CTASection() {
  return (
    <section id="pricing" className="py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--pl-purple)] via-[var(--pl-purple-dark)] to-[var(--pl-purple)]" />
      <div className="absolute inset-0 bg-mesh opacity-30" />
      
      {/* Animated orbs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[var(--pl-magenta)] rounded-full opacity-20 blur-[100px]" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[var(--pl-cyan)] rounded-full opacity-20 blur-[100px]" />

      <div className="container relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Level Up Your{' '}
            <span className="text-[var(--pl-cyan)]">FPL Game</span>?
          </h2>
          <p className="text-lg text-white/80 mb-8">
            Join thousands of FPL managers using Crystal XI to plan ahead and make smarter decisions.
            It's completely free!
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/register"
              className={cn(
                'inline-flex items-center gap-2',
                'px-8 py-4 rounded-xl',
                'bg-[var(--pl-cyan)] text-[var(--pl-purple-dark)]',
                'font-bold text-lg',
                'shadow-lg shadow-[var(--pl-cyan)]/30',
                'hover:shadow-xl hover:shadow-[var(--pl-cyan)]/40',
                'hover:-translate-y-1',
                'transition-all duration-300'
              )}
            >
              Get Started Free
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 mt-12 text-white/60 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Secure Login
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              No Credit Card Required
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Instant Access
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

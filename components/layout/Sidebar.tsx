'use client';

import { cn } from '@/lib/utils';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/ui/Toggle';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';

const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: 'Planner',
    href: '/dashboard/planner',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: 'Transfers',
    href: '/dashboard/transfers',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
  },
  {
    label: 'Compare',
    href: '/dashboard/compare',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    label: 'Team',
    href: '/dashboard/team',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col',
        'h-screen sticky top-0',
        'bg-[var(--surface)] backdrop-blur-xl',
        'border-r border-[var(--surface-border)]',
        'transition-all duration-300',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b border-[var(--surface-border)]">
        <Logo size="md" showText={!isCollapsed} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl',
                    'transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-[var(--pl-magenta)] to-[var(--pl-magenta-dark)] text-white shadow-md shadow-[var(--pl-magenta)]/30'
                      : 'text-[var(--foreground-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]'
                  )}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!isCollapsed && <span className="font-medium">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-[var(--surface-border)]">
        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            'w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl',
            'text-[var(--foreground-muted)] hover:text-[var(--foreground)]',
            'hover:bg-[var(--surface-hover)]',
            'transition-all duration-200'
          )}
        >
          <svg
            className={cn('w-5 h-5 transition-transform', isCollapsed && 'rotate-180')}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
          {!isCollapsed && <span className="text-sm">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}

export function DashboardHeader() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header
      className={cn(
        'sticky top-0 z-[var(--z-sticky)]',
        'bg-[var(--surface)] backdrop-blur-xl',
        'border-b border-[var(--surface-border)]'
      )}
    >
      <div className="px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile Menu + Logo */}
          <div className="flex items-center gap-4 lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Logo size="sm" />
          </div>

          {/* Page Title - Desktop */}
          <div className="hidden lg:block">
            <h1 className="text-xl font-semibold text-[var(--foreground)]">
              {navItems.find((item) => item.href === pathname)?.label || 'Dashboard'}
            </h1>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            <ThemeToggle size="sm" />

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={cn(
                  'flex items-center gap-2 p-1.5 pr-3 rounded-xl',
                  'bg-[var(--surface-hover)] hover:bg-[var(--surface)]',
                  'border border-[var(--surface-border)]',
                  'transition-colors duration-200'
                )}
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--pl-magenta)] to-[var(--pl-purple)] flex items-center justify-center text-white font-bold text-sm">
                  {session?.user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <svg className="w-4 h-4 text-[var(--foreground-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown */}
              {isMenuOpen && (
                <div
                  className={cn(
                    'absolute right-0 mt-2 w-56',
                    'bg-[var(--surface-elevated)] backdrop-blur-xl',
                    'border border-[var(--surface-border)]',
                    'rounded-xl shadow-[var(--shadow-lg)]',
                    'animate-scale-in origin-top-right'
                  )}
                >
                  <div className="p-3 border-b border-[var(--surface-border)]">
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      {session?.user?.email}
                    </p>
                  </div>
                  <div className="p-2">
                    <Link
                      href="/dashboard/team"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--foreground)] hover:bg-[var(--surface)]"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Settings
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-500/10"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-[var(--surface-border)] animate-fade-in-down">
          <nav className="p-4">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl',
                        'transition-all duration-200',
                        isActive
                          ? 'bg-gradient-to-r from-[var(--pl-magenta)] to-[var(--pl-magenta-dark)] text-white'
                          : 'text-[var(--foreground-secondary)] hover:bg-[var(--surface-hover)]'
                      )}
                    >
                      {item.icon}
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}

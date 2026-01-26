'use client';

import { useTheme } from '@/components/theme-provider';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ThemeToggle({ className, size = 'md' }: ThemeToggleProps) {
  const { resolvedTheme, setTheme, mounted } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className={cn(sizes[size], 'rounded-xl bg-[var(--surface)] border border-[var(--surface-border)]', className)} />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'relative inline-flex items-center justify-center',
        'rounded-xl',
        'bg-[var(--surface)] backdrop-blur-xl',
        'border border-[var(--surface-border)]',
        'hover:bg-[var(--surface-hover)] hover:border-[var(--surface-border-hover)]',
        'active:scale-95',
        'transition-all duration-300 ease-out',
        'group',
        sizes[size],
        className
      )}
      aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {/* Sun icon */}
      <svg
        className={cn(
          iconSizes[size],
          'text-amber-500',
          'absolute transition-all duration-500',
          resolvedTheme === 'dark'
            ? 'opacity-100 rotate-0 scale-100'
            : 'opacity-0 rotate-90 scale-50'
        )}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>

      {/* Moon icon */}
      <svg
        className={cn(
          iconSizes[size],
          'text-[var(--pl-magenta)]',
          'absolute transition-all duration-500',
          resolvedTheme === 'light'
            ? 'opacity-100 rotate-0 scale-100'
            : 'opacity-0 -rotate-90 scale-50'
        )}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>

      {/* Glow effect on hover */}
      <div
        className={cn(
          'absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100',
          'transition-opacity duration-300',
          resolvedTheme === 'dark'
            ? 'shadow-[0_0_20px_rgba(251,191,36,0.3)]'
            : 'shadow-[0_0_20px_rgba(255,40,130,0.3)]'
        )}
      />
    </button>
  );
}

// Compact theme toggle for mobile
export function ThemeToggleCompact({ className }: { className?: string }) {
  const { resolvedTheme, setTheme, mounted } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  if (!mounted) {
    return <div className={cn('h-9 rounded-lg bg-[var(--surface)]', className)} />;
  }

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'flex items-center gap-2 w-full px-3 py-2',
        'text-[var(--foreground)] text-sm font-medium',
        'rounded-lg hover:bg-[var(--surface)]',
        'transition-colors duration-200',
        className
      )}
    >
      {resolvedTheme === 'dark' ? (
        <>
          <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
          <span>Light Mode</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5 text-[var(--pl-magenta)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
          <span>Dark Mode</span>
        </>
      )}
    </button>
  );
}

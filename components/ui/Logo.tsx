'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  href?: string;
}

export function Logo({ size = 'md', showText = true, className, href = '/' }: LogoProps) {
  const sizes = {
    sm: { icon: 24, text: 'text-lg' },
    md: { icon: 32, text: 'text-xl' },
    lg: { icon: 40, text: 'text-2xl' },
    xl: { icon: 56, text: 'text-3xl' },
  };

  const content = (
    <div className={cn('flex items-center gap-2 group', className)}>
      {/* Crystal Icon */}
      <div className="relative">
        <svg
          width={sizes[size].icon}
          height={sizes[size].icon}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 group-hover:scale-110"
        >
          {/* Crystal shape */}
          <defs>
            <linearGradient id="crystalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--pl-magenta)" />
              <stop offset="50%" stopColor="var(--pl-purple)" />
              <stop offset="100%" stopColor="var(--pl-cyan)" />
            </linearGradient>
            <linearGradient id="crystalShine" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          
          {/* Main crystal body */}
          <path
            d="M24 4L40 18L24 44L8 18L24 4Z"
            fill="url(#crystalGradient)"
            filter="url(#glow)"
          />
          
          {/* Crystal facets */}
          <path
            d="M24 4L40 18L24 26L24 4Z"
            fill="rgba(255,255,255,0.2)"
          />
          <path
            d="M24 26L40 18L24 44L24 26Z"
            fill="rgba(0,0,0,0.1)"
          />
          <path
            d="M8 18L24 26L24 44L8 18Z"
            fill="rgba(0,0,0,0.15)"
          />
          
          {/* Shine effect */}
          <path
            d="M24 4L30 12L24 14L18 12L24 4Z"
            fill="url(#crystalShine)"
          />
          
          {/* Inner glow */}
          <circle
            cx="24"
            cy="20"
            r="4"
            fill="white"
            opacity="0.3"
          />
        </svg>
        
        {/* Animated glow ring */}
        <div
          className={cn(
            'absolute inset-0 rounded-full opacity-0 group-hover:opacity-100',
            'transition-opacity duration-300',
            'pointer-events-none'
          )}
          style={{
            background: 'radial-gradient(circle, rgba(255,40,130,0.3) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Text */}
      {showText && (
        <span
          className={cn(
            'font-bold tracking-tight',
            sizes[size].text,
            'bg-gradient-to-r from-[var(--pl-magenta)] via-[var(--pl-purple)] to-[var(--foreground)]',
            'bg-clip-text text-transparent',
            'transition-all duration-300'
          )}
        >
          Crystal<span className="text-[var(--pl-cyan)]">XI</span>
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="no-underline">
        {content}
      </Link>
    );
  }

  return content;
}

// Simple text-only logo for smaller spaces
export function LogoText({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <span
      className={cn(
        'font-bold tracking-tight',
        sizes[size],
        'bg-gradient-to-r from-[var(--pl-magenta)] to-[var(--pl-purple)]',
        'bg-clip-text text-transparent',
        className
      )}
    >
      Crystal<span className="text-[var(--pl-cyan)]">XI</span>
    </span>
  );
}

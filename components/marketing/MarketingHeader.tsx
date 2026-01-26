'use client';

import { cn } from '@/lib/utils';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/Toggle';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export function MarketingHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
  ];

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-[var(--z-sticky)]',
        'transition-all duration-300',
        isScrolled
          ? 'bg-[var(--surface)] backdrop-blur-xl border-b border-[var(--surface-border)] shadow-[var(--shadow-sm)]'
          : 'bg-transparent'
      )}
    >
      <div className="container">
        <nav className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Logo size="md" />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium',
                  'text-[var(--foreground-secondary)] hover:text-[var(--foreground)]',
                  'transition-colors duration-200'
                )}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle size="sm" />
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Log In
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" size="sm">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle size="sm" />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={cn(
                'p-2 rounded-lg',
                'text-[var(--foreground)]',
                'hover:bg-[var(--surface)]',
                'transition-colors duration-200'
              )}
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div
            className={cn(
              'md:hidden',
              'pb-6',
              'animate-fade-in-down'
            )}
          >
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'px-4 py-3 rounded-lg',
                    'text-[var(--foreground)]',
                    'hover:bg-[var(--surface)]',
                    'transition-colors duration-200'
                  )}
                >
                  {link.label}
                </a>
              ))}
              <hr className="my-2 border-[var(--surface-border)]" />
              <div className="flex flex-col gap-2 px-4">
                <Link href="/login">
                  <Button variant="ghost" className="w-full justify-center">
                    Log In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" className="w-full justify-center">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/ui/Toggle';
import { cn } from '@/lib/utils';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^a-zA-Z\d]/.test(pwd)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (!acceptTerms) {
      setError('Please accept the terms and conditions');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
        return;
      }

      router.push('/login?registered=true');
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-mesh" />
      
      {/* Animated gradient orbs */}
      <div className="absolute top-0 -right-32 w-96 h-96 bg-[var(--pl-cyan)] rounded-full opacity-20 blur-[120px] animate-pulse" />
      <div className="absolute bottom-0 -left-32 w-96 h-96 bg-[var(--pl-magenta)] rounded-full opacity-15 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--pl-purple)] rounded-full opacity-10 blur-[150px]" />

      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle size="md" />
      </div>

      {/* Register Card */}
      <Card
        variant="elevated"
        padding="lg"
        className={cn(
          'w-full max-w-md',
          'animate-scale-in'
        )}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Logo size="lg" href="/" className="justify-center mb-4" />
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Create an account</h1>
          <p className="text-[var(--foreground-muted)] mt-1">
            Start planning your FPL success
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 animate-fade-in">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm text-red-500">{error}</p>
            </div>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            // Name is optional in your schema but good for UX? 
            // The prompt implied adding it, let's make it optional or required based on preference.
            // I'll make it optional to match schema strictness, or required for better data?
            // The plan said "Add a Name input field". I'll default to standard optional unless specified.
            // Wait, usually registration forms require names. Let's make it not strictly required validation-wise if not needed, 
            // but usually UX prefers it. I'll leave 'required' prop off if schema doesn't force it, but usually standard is to ask.
            // Actually, let's just add the input. I'll add 'required' to be safe for data quality.
            required
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
          />

          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            }
          />

          <div>
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            />
            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        'h-1 flex-1 rounded-full transition-all duration-300',
                        i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-[var(--surface-border)]'
                      )}
                    />
                  ))}
                </div>
                <p className="text-xs text-[var(--foreground-muted)]">
                  Password strength: {passwordStrength > 0 ? strengthLabels[passwordStrength - 1] : 'Too weak'}
                </p>
              </div>
            )}
          </div>

          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            error={confirmPassword && password !== confirmPassword ? "Passwords don't match" : undefined}
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            }
          />

          {/* Terms Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-[var(--surface-border)] text-[var(--pl-magenta)] focus:ring-[var(--pl-magenta)]"
            />
            <span className="text-sm text-[var(--foreground-muted)]">
              I agree to the{' '}
              <a href="#" className="text-[var(--pl-magenta)] hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-[var(--pl-magenta)] hover:underline">
                Privacy Policy
              </a>
            </span>
          </label>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={loading}
            className="w-full"
          >
            Create Account
          </Button>
        </form>

        {/* Login Link */}
        <p className="mt-8 text-center text-sm text-[var(--foreground-muted)]">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-semibold text-[var(--pl-magenta)] hover:text-[var(--pl-magenta-light)] transition-colors"
          >
            Sign in instead
          </Link>
        </p>
      </Card>
    </div>
  );
}

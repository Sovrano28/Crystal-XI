'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useUserTeam } from '@/hooks/useTeam';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

export default function TeamPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { fplTeamId, loading, updateTeamId } = useUserTeam();
  const [teamIdInput, setTeamIdInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const handleSave = async () => {
    const teamId = parseInt(teamIdInput);
    if (isNaN(teamId) || teamId <= 0) {
      setMessage('Please enter a valid team ID');
      setMessageType('error');
      return;
    }

    setSaving(true);
    setMessage('');
    const success = await updateTeamId(teamId);
    if (success) {
      setMessage('Team ID saved successfully! Redirecting to dashboard...');
      setMessageType('success');
      setTeamIdInput('');
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 1500);
    } else {
      setMessage('Failed to update team ID. Please try again.');
      setMessageType('error');
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">
          Team Settings
        </h1>
        <p className="text-[var(--foreground-muted)] mt-1">
          Manage your FPL team connection
        </p>
      </div>

      {/* Current Team Status */}
      {fplTeamId && !saving && !message.includes('successfully') && (
        <Card glow glowColor="cyan" className="animate-fade-in-up">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--pl-cyan)]/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-[var(--pl-cyan)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-[var(--foreground)]">Team Connected</h3>
              <p className="text-sm text-[var(--foreground-muted)]">
                Your FPL Team ID: <span className="font-bold text-[var(--pl-cyan)]">{fplTeamId}</span>
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Update Team ID */}
      <Card>
        <CardHeader>
          <CardTitle>{fplTeamId ? 'Update Team ID' : 'Connect Your FPL Team'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Instructions */}
          <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--surface-border)]">
            <h4 className="font-medium text-[var(--foreground)] mb-2">How to find your Team ID</h4>
            <ol className="text-sm text-[var(--foreground-muted)] space-y-2 list-decimal list-inside">
              <li>Go to the official FPL website</li>
              <li>Click on "Points" tab to view your team</li>
              <li>Look at the URL — it will look like: <br />
                <code className="bg-[var(--background-secondary)] px-2 py-0.5 rounded text-[var(--foreground)]">
                  fantasy.premierleague.com/entry/<span className="text-[var(--pl-cyan)]">123456</span>/event/...
                </code>
              </li>
              <li>The number after "/entry/" is your Team ID (e.g., <span className="text-[var(--pl-cyan)] font-medium">123456</span>)</li>
            </ol>
          </div>

          {/* Input */}
          <Input
            label="FPL Team ID"
            type="number"
            placeholder={fplTeamId ? `Current: ${fplTeamId}` : 'Enter your team ID'}
            value={teamIdInput}
            onChange={(e) => setTeamIdInput(e.target.value)}
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
            }
          />

          {/* Message */}
          {message && (
            <div
              className={cn(
                'p-4 rounded-xl animate-fade-in',
                messageType === 'success'
                  ? 'bg-green-500/10 border border-green-500/20'
                  : 'bg-red-500/10 border border-red-500/20'
              )}
            >
              <div className="flex items-center gap-3">
                {messageType === 'success' ? (
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                <p className={cn('text-sm', messageType === 'success' ? 'text-green-500' : 'text-red-500')}>
                  {message}
                </p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            variant="primary"
            size="lg"
            onClick={handleSave}
            disabled={saving || loading || !teamIdInput}
            isLoading={saving}
            className="w-full"
          >
            {fplTeamId ? 'Update Team ID' : 'Connect Team'}
          </Button>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card variant="bordered" padding="md">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg bg-[var(--pl-magenta)]/10 text-[var(--pl-magenta)]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="font-medium text-[var(--foreground)] mb-1">Pro Tip</h4>
            <p className="text-sm text-[var(--foreground-muted)]">
              Your FPL data is synced automatically. We pull the latest team data every time you visit the planner.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

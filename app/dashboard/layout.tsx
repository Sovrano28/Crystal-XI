'use client';

import { Sidebar, DashboardHeader } from '@/components/layout/Sidebar';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/login');
    }
  }, [status]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-[var(--pl-magenta)] border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-[var(--foreground-muted)]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex">
      {/* Sidebar - Desktop */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <DashboardHeader />
        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-blue-600">
              Crystal XI
            </Link>
            {session && (
              <nav className="ml-8 flex space-x-4">
                <Link
                  href="/"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/planner"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Planner
                </Link>
                <Link
                  href="/team"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Team
                </Link>
              </nav>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <span className="text-sm text-gray-700">{session.user?.email}</span>
                <Button variant="outline" size="sm" onClick={() => signOut()}>
                  Sign Out
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button variant="primary" size="sm">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}


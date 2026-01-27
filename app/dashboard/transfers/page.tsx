'use client';

import { useUserTeam } from '@/hooks/useTeam';
import { useBootstrapData, useTeamData } from '@/hooks/useFPLData';
import { TransferPlanner } from '@/components/transfers/TransferPlanner';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { FPLTeamPicks } from '@/types/fpl';

export default function TransfersPage() {
  const { fplTeamId, loading: teamIdLoading } = useUserTeam();
  const { data: bootstrap, loading: bootstrapLoading } = useBootstrapData();
  
  // We need to fetch the team's picks. useTeamData fetches the general info.
  // We need a way to get the *current* or *latest* picks.
  // The useTeamData hook might return general info, let's allow TransferPlanner to handle specific picks fetching if needed,
  // or we can fetch it here.
  // Actually, useTeamData returns FPLTeamPicks (which includes picks array) based on the lib function we saw earlier?
  // No, `fetchTeamData` in lib returns `FPLGeneralTeamData` now (I changed it).
  // So `useTeamData` hook probably returns `FPLGeneralTeamData`.
  // `TransferPlanner` needs `FPLTeamPicks`.
  
  // Let's check `useFPLData` hook implementation to be sure.
  // Assuming we might need to fetch picks separately or the hook handles it.
  // For now, I'll assume we need to fetch picks.
  
  // Wait, I can't check the hook right now without viewing it.
  // Let's start by creating the page with loading states and fetching what we can.
  // I'll fetch picks inside a useEffect if the hook doesn't provide it.
  
  return <TransfersPageContent fplTeamId={fplTeamId} teamIdLoading={teamIdLoading} bootstrap={bootstrap} bootstrapLoading={bootstrapLoading} />;
}

import { useEffect, useState } from 'react';

function TransfersPageContent({ fplTeamId, teamIdLoading, bootstrap, bootstrapLoading }: any) {
  const [picks, setPicks] = useState<FPLTeamPicks | null>(null);
  const [picksLoading, setPicksLoading] = useState(false);

  useEffect(() => {
    async function fetchPicks() {
      if (!fplTeamId || !bootstrap) return;
      
      setPicksLoading(true);
      try {
        const currentEvent = bootstrap.events.find((e: any) => e.is_current)?.id || 1;
        const res = await fetch(`/api/fpl/team/${fplTeamId}`);
        const data = await res.json();
        
        // The API route now returns { ...picksData, entry_history: ... }
        // So it matches FPLTeamPicks interface roughly
        setPicks(data);
      } catch (err) {
        console.error("Error fetching picks", err);
      } finally {
        setPicksLoading(false);
      }
    }
    
    fetchPicks();
  }, [fplTeamId, bootstrap]);

  const isLoading = teamIdLoading || bootstrapLoading || picksLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="inline-block w-12 h-12 border-4 border-[var(--pl-magenta)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!fplTeamId) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Card className="text-center p-8 max-w-md">
           <h2 className="text-xl font-bold mb-4">No Team Connected</h2>
           <p className="text-[var(--foreground-muted)] mb-6">
             Please connect your FPL team ID to use the transfer planner.
           </p>
           <Link href="/dashboard/team">
             <Button variant="glow">Connect Team</Button>
           </Link>
        </Card>
      </div>
    );
  }

  if (!bootstrap || !picks) {
     return <div>Error loading data</div>;
  }

  return (
    <div className="h-full flex flex-col">
       <div className="mb-6">
         <h1 className="text-2xl font-bold text-[var(--foreground)]">Transfer Planner</h1>
         <p className="text-[var(--foreground-muted)]">Plan your transfers for Gameweek {picks.entry_history.event + 1}</p>
       </div>
       
       <div className="flex-1">
         <TransferPlanner 
            initialPicks={picks} 
            bootstrap={bootstrap} 
            teamId={parseInt(fplTeamId)} 
         />
       </div>
    </div>
  );
}

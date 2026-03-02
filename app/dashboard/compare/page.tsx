import { Metadata } from 'next';
import { fetchBootstrapStatic, fetchFixtures, getPlanningGameweek } from '@/lib/fpl-api';
import { CompareClient } from '@/components/compare/CompareClient';

export const metadata: Metadata = {
  title: 'Compare Players & Teams | Crystal XI',
  description: 'Analyze advanced FPL metrics side-by-side to make the best transfer decisions.',
};

export default async function ComparePage() {
  const [bootstrap, fixtures] = await Promise.all([
    fetchBootstrapStatic(),
    fetchFixtures()
  ]);

  const currentGameweek = getPlanningGameweek(bootstrap.events);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 sm:px-6 lg:px-8 py-8">
      <CompareClient 
        players={bootstrap.elements} 
        teams={bootstrap.teams} 
        fixtures={fixtures} 
        currentGameweek={currentGameweek} 
      />
    </div>
  );
}

import { useState, useEffect } from 'react';
import { FPLEvent } from '@/types/fpl';
import { useBootstrapData } from './useFPLData';
import { getPlanningGameweek, getScoringGameweek } from '@/lib/fpl-api';

export function useGameweeks() {
  const { data: bootstrap } = useBootstrapData();
  const [planningGameweek, setPlanningGameweek] = useState<number>(1);
  const [scoringGameweek, setScoringGameweek] = useState<number>(1);
  const [remainingGameweeks, setRemainingGameweeks] = useState<FPLEvent[]>([]);

  useEffect(() => {
    if (!bootstrap) return;

    const planningGW = getPlanningGameweek(bootstrap.events);
    const scoringGW = getScoringGameweek(bootstrap.events);
    
    setPlanningGameweek(planningGW);
    setScoringGameweek(scoringGW);

    const remaining = bootstrap.events.filter(
      (event) => event.id >= planningGW && !event.finished
    );
    setRemainingGameweeks(remaining);
  }, [bootstrap]);

  return {
    planningGameweek,
    scoringGameweek,
    currentGameweek: planningGameweek, // For backward compatibility
    remainingGameweeks,
    allGameweeks: bootstrap?.events || [],
  };
}


import { useState, useEffect } from 'react';
import { FPLEvent } from '@/types/fpl';
import { useBootstrapData } from './useFPLData';

export function useGameweeks() {
  const { data: bootstrap } = useBootstrapData();
  const [currentGameweek, setCurrentGameweek] = useState<number>(1);
  const [remainingGameweeks, setRemainingGameweeks] = useState<FPLEvent[]>([]);

  useEffect(() => {
    if (!bootstrap) return;

    const current = bootstrap.events.find((event) => event.is_current);
    if (current) {
      setCurrentGameweek(current.id);
    }

    const remaining = bootstrap.events.filter(
      (event) => event.id >= (current?.id || 1) && !event.finished
    );
    setRemainingGameweeks(remaining);
  }, [bootstrap]);

  return {
    currentGameweek,
    remainingGameweeks,
    allGameweeks: bootstrap?.events || [],
  };
}


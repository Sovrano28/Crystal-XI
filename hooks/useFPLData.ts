import { useState, useEffect } from 'react';
import { FPLBootstrapStatic, FPLFixture, FPLTeamPicks } from '@/types/fpl';

export function useBootstrapData() {
  const [data, setData] = useState<FPLBootstrapStatic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch('/api/fpl/bootstrap');
        if (!response.ok) throw new Error('Failed to fetch data');
        const json = await response.json();
        setData(json);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { data, loading, error };
}

export function useFixtures() {
  const [data, setData] = useState<FPLFixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch('/api/fpl/fixtures');
        if (!response.ok) throw new Error('Failed to fetch fixtures');
        const json = await response.json();
        setData(json);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { data, loading, error };
}

export function useTeamData(teamId: number | null, mode: 'default' | 'planner' = 'default') {
  const [data, setData] = useState<FPLTeamPicks | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = () => {
    setRefreshKey((prev) => prev + 1);
  };

  useEffect(() => {
    if (!teamId) {
      setData(null);
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        const url = `/api/fpl/team/${teamId}${mode === 'planner' ? '?mode=planner' : ''}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch team data');
        const json = await response.json();
        setData(json);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [teamId, mode, refreshKey]);

  return { data, loading, error, refetch };
}


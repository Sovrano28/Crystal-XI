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

export function useTeamData(teamId: number | null) {
  const [data, setData] = useState<FPLTeamPicks | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!teamId) {
      setData(null);
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch(`/api/fpl/team/${teamId}`);
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
  }, [teamId]);

  return { data, loading, error };
}


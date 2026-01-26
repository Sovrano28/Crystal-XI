import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

export function useUserTeam() {
  const { data: session } = useSession();
  const [fplTeamId, setFplTeamId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTeamId = useCallback(async () => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/user/team');
      if (response.ok) {
        const data = await response.json();
        setFplTeamId(data.fplTeamId || null);
      }
    } catch (error) {
      console.error('Error fetching team ID:', error);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchTeamId();
  }, [fetchTeamId]);

  const updateTeamId = async (teamId: number) => {
    try {
      const response = await fetch('/api/user/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fplTeamId: teamId }),
      });

      if (response.ok) {
        // Update local state immediately
        setFplTeamId(teamId);
        // Refetch from server to ensure consistency
        await fetchTeamId();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating team ID:', error);
      return false;
    }
  };

  return { fplTeamId, loading, updateTeamId, refetch: fetchTeamId };
}

// Alias for backward compatibility
export const useTeam = useUserTeam;


import {
  FPLBootstrapStatic,
  FPLTeamPicks,
  FPLFixture,
  FPLPlayer,
  FPLTeam,
  PlayerFixture,
  PlayerWithFixtures,
} from '@/types/fpl';

const FPL_API_BASE = 'https://fantasy.premierleague.com/api';

// Cache for bootstrap static data (refreshes daily)
let bootstrapCache: { data: FPLBootstrapStatic | null; timestamp: number } = {
  data: null,
  timestamp: 0,
};

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function fetchBootstrapStatic(): Promise<FPLBootstrapStatic> {
  const now = Date.now();
  
  // Return cached data if still valid
  if (bootstrapCache.data && now - bootstrapCache.timestamp < CACHE_DURATION) {
    return bootstrapCache.data;
  }

  try {
    const response = await fetch(`${FPL_API_BASE}/bootstrap-static/`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!response.ok) {
      throw new Error(`FPL API error: ${response.statusText}`);
    }

    const data: FPLBootstrapStatic = await response.json();
    bootstrapCache = { data, timestamp: now };
    return data;
  } catch (error) {
    // If fetch fails and we have cached data, return it
    if (bootstrapCache.data) {
      return bootstrapCache.data;
    }
    throw error;
  }
}

export async function fetchBootstrapDynamic() {
  try {
    const response = await fetch(`${FPL_API_BASE}/bootstrap-dynamic/`, {
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    });

    if (!response.ok) {
      throw new Error(`FPL API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function fetchTeamData(teamId: number): Promise<FPLTeamPicks> {
  try {
    const response = await fetch(`${FPL_API_BASE}/entry/${teamId}/`, {
      next: { revalidate: 60 }, // Revalidate every minute
    });

    if (!response.ok) {
      throw new Error(`FPL API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function fetchTeamHistory(teamId: number) {
  try {
    const response = await fetch(`${FPL_API_BASE}/entry/${teamId}/history/`, {
      next: { revalidate: 60 }, // Revalidate every minute
    });

    if (!response.ok) {
      throw new Error(`FPL API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // The history endpoint returns { current: [...], past: [...] }
    // We need to find the entry with the highest event number across both arrays
    let allEntries: any[] = [];
    
    if (data.current && Array.isArray(data.current)) {
      allEntries = [...allEntries, ...data.current];
    }
    if (data.past && Array.isArray(data.past)) {
      allEntries = [...allEntries, ...data.past];
    }
    
    if (allEntries.length > 0) {
      // Sort by event number descending to get the most recent
      const sorted = allEntries.sort((a, b) => (b.event || 0) - (a.event || 0));
      const latest = sorted[0];
      
      console.log(`[fetchTeamHistory] All entries for team ${teamId} (showing last 5):`, 
        sorted.slice(0, 5).map((e: any) => ({ event: e.event, value: e.value, bank: e.bank }))
      );
      
      console.log(`[fetchTeamHistory] Latest entry_history for team ${teamId}:`, {
        event: latest.event,
        value: latest.value,
        bank: latest.bank,
        total_points: latest.total_points,
      });
      return latest;
    }
    
    // Fallback: if no current/past structure, check if it's just an array
    if (Array.isArray(data) && data.length > 0) {
      const sorted = [...data].sort((a, b) => (b.event || 0) - (a.event || 0));
      const latest = sorted[0];
      console.log(`[fetchTeamHistory] Latest entry_history (array format) for team ${teamId}:`, {
        event: latest.event,
        value: latest.value,
        bank: latest.bank,
      });
      return latest;
    }
    
    // Alternative structure: might be just an array
    if (Array.isArray(data) && data.length > 0) {
      const sorted = [...data].sort((a, b) => (b.event || 0) - (a.event || 0));
      const latest = sorted[0];
      console.log(`[fetchTeamHistory] Latest entry_history (array format) for team ${teamId}:`, {
        event: latest.event,
        value: latest.value,
        bank: latest.bank,
      });
      return latest;
    }
    
    console.warn(`[fetchTeamHistory] No valid data found for team ${teamId}`, data);
    return null;
  } catch (error) {
    console.error('Error in fetchTeamHistory:', error);
    throw error;
  }
}

export async function fetchTeamPicks(teamId: number, eventId: number): Promise<FPLTeamPicks> {
  try {
    const response = await fetch(`${FPL_API_BASE}/entry/${teamId}/event/${eventId}/picks/`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error(`FPL API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function fetchFixtures(): Promise<FPLFixture[]> {
  try {
    const response = await fetch(`${FPL_API_BASE}/fixtures/`, {
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    });

    if (!response.ok) {
      throw new Error(`FPL API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Get upcoming fixtures for a player across all remaining gameweeks
 */
export function getPlayerFixtures(
  playerId: number,
  playerTeamId: number,
  fixtures: FPLFixture[],
  teams: FPLTeam[],
  currentGameweek: number
): PlayerFixture[] {
  const playerFixtures: PlayerFixture[] = [];

  // Filter fixtures for this player's team and future gameweeks
  const relevantFixtures = fixtures.filter(
    (fixture) =>
      (fixture.team_h === playerTeamId || fixture.team_a === playerTeamId) &&
      fixture.event >= currentGameweek &&
      !fixture.finished
  );

  for (const fixture of relevantFixtures) {
    const isHome = fixture.team_h === playerTeamId;
    const opponentId = isHome ? fixture.team_a : fixture.team_h;
    const opponent = teams.find((team) => team.id === opponentId);

    if (opponent) {
      playerFixtures.push({
        gameweek: fixture.event,
        opponent,
        isHome,
        difficulty: isHome ? fixture.team_h_difficulty : fixture.team_a_difficulty,
        fixture,
      });
    }
  }

  return playerFixtures.sort((a, b) => a.gameweek - b.gameweek);
}

/**
 * Get all players with their upcoming fixtures
 */
export async function getPlayersWithFixtures(
  playerIds: number[],
  currentGameweek: number
): Promise<PlayerWithFixtures[]> {
  const [bootstrap, fixtures] = await Promise.all([fetchBootstrapStatic(), fetchFixtures()]);

  const players: PlayerWithFixtures[] = [];

  for (const playerId of playerIds) {
    const player = bootstrap.elements.find((p) => p.id === playerId);
    if (!player) continue;

    const playerFixtures = getPlayerFixtures(
      playerId,
      player.team,
      fixtures,
      bootstrap.teams,
      currentGameweek
    );

    players.push({
      ...player,
      upcomingFixtures: playerFixtures,
    });
  }

  return players;
}

/**
 * Get current gameweek number
 */
export async function getCurrentGameweek(): Promise<number> {
  const bootstrap = await fetchBootstrapStatic();
  const currentEvent = bootstrap.events.find((event) => event.is_current);
  return currentEvent?.id || 1;
}


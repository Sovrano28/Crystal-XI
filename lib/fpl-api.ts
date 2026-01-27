import {
  FPLBootstrapStatic,
  FPLTeamPicks,
  FPLFixture,
  FPLPlayer,
  FPLTeam,
  PlayerFixture,
  PlayerWithFixtures,
  FPLGeneralTeamData,
  FPLEvent,
  PlayerPoints,
  PlayerWithPoints,
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

export async function fetchTeamData(teamId: number): Promise<FPLGeneralTeamData> {
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
  currentGameweek: number,
  events?: FPLEvent[]
): PlayerFixture[] {
  const playerFixtures: PlayerFixture[] = [];

  // Helper function to determine gameweek from kickoff time if event is null
  const getGameweekFromKickoff = (kickoffTime: string | null | undefined): number | null => {
    if (!kickoffTime || !events || events.length === 0) return null;
    
    try {
      const kickoff = new Date(kickoffTime);
      if (isNaN(kickoff.getTime())) return null;
      
      // Sort events by deadline to ensure correct order
      const sortedEvents = [...events].sort((a, b) => a.id - b.id);
      
      // Find the gameweek where the kickoff time falls between its deadline and the next gameweek's deadline
      for (let i = 0; i < sortedEvents.length; i++) {
        const event = sortedEvents[i];
        const deadline = new Date(event.deadline_time);
        
        if (isNaN(deadline.getTime())) continue;
        
        // If this is the last event, check if kickoff is after its deadline
        if (i === sortedEvents.length - 1) {
          if (kickoff >= deadline) {
            return event.id;
          }
        } else {
          const nextEvent = sortedEvents[i + 1];
          const nextDeadline = new Date(nextEvent.deadline_time);
          
          if (isNaN(nextDeadline.getTime())) continue;
          
          if (kickoff >= deadline && kickoff < nextDeadline) {
            return event.id;
          }
        }
      }
      
      // If kickoff is before all deadlines, assign to the first upcoming gameweek
      const upcomingEvents = sortedEvents.filter(e => e.id >= currentGameweek && !e.finished);
      if (upcomingEvents.length > 0) {
        const firstUpcoming = upcomingEvents[0];
        const firstDeadline = new Date(firstUpcoming.deadline_time);
        if (!isNaN(firstDeadline.getTime()) && kickoff < firstDeadline) {
          return firstUpcoming.id;
        }
      }
    } catch (error) {
      console.error('Error determining gameweek from kickoff time:', error);
    }
    
    return null;
  };

  // Filter fixtures for this player's team and future gameweeks
  const relevantFixtures = fixtures.filter((fixture) => {
    // Check if fixture is for this player's team
    if (fixture.team_h !== playerTeamId && fixture.team_a !== playerTeamId) {
      return false;
    }
    
    // Skip finished fixtures
    if (fixture.finished) {
      return false;
    }
    
    // Determine the gameweek for this fixture
    let fixtureGameweek: number | null = fixture.event;
    
    // If event is null/undefined, try to determine from kickoff time
    if (!fixtureGameweek && fixture.kickoff_time) {
      fixtureGameweek = getGameweekFromKickoff(fixture.kickoff_time);
    }
    
    // Only include fixtures with a valid gameweek >= currentGameweek
    return fixtureGameweek !== null && fixtureGameweek >= currentGameweek;
  });

  for (const fixture of relevantFixtures) {
    const isHome = fixture.team_h === playerTeamId;
    const opponentId = isHome ? fixture.team_a : fixture.team_h;
    const opponent = teams.find((team) => team.id === opponentId);

    if (opponent) {
      // Determine gameweek (use event if available, otherwise calculate from kickoff)
      let fixtureGameweek = fixture.event;
      if (!fixtureGameweek && fixture.kickoff_time && events) {
        fixtureGameweek = getGameweekFromKickoff(fixture.kickoff_time) || currentGameweek;
      }
      
      // Fallback to currentGameweek if still null (shouldn't happen after filter, but safety check)
      if (!fixtureGameweek) {
        fixtureGameweek = currentGameweek;
      }

      playerFixtures.push({
        gameweek: fixtureGameweek,
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
      currentGameweek,
      bootstrap.events
    );

    players.push({
      ...player,
      upcomingFixtures: playerFixtures,
    });
  }

  return players;
}

/**
 * Get planning gameweek number (for fixture planning - uses next gameweek if deadline has passed)
 */
export function getPlanningGameweek(events: FPLEvent[]): number {
  const currentEvent = events.find((e) => e.is_current);
  const nextEvent = events.find((e) => e.is_next);

  if (!currentEvent) return 1;

  const deadline = new Date(currentEvent.deadline_time);
  const now = new Date();

  // If deadline has passed, use next gameweek for planning
  if (now >= deadline && nextEvent) {
    return nextEvent.id;
  }

  return currentEvent.id;
}

/**
 * Get scoring gameweek number (the gameweek for which points are being accumulated)
 */
export function getScoringGameweek(events: FPLEvent[]): number {
  const currentEvent = events.find((e) => e.is_current);
  return currentEvent?.id || 1;
}

/**
 * Get current gameweek number (legacy - returns planning gameweek for backward compatibility)
 */
export async function getCurrentGameweek(): Promise<number> {
  const bootstrap = await fetchBootstrapStatic();
  return getPlanningGameweek(bootstrap.events);
}

/**
 * Fetch player summary data from FPL API
 */
export async function fetchPlayerSummary(playerId: number) {
  try {
    const response = await fetch(`${FPL_API_BASE}/element-summary/${playerId}/`, {
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
 * Get player points for a specific gameweek
 */
export async function getPlayerPointsForGameweek(
  playerId: number,
  gameweek: number
): Promise<PlayerPoints | null> {
  try {
    const summary = await fetchPlayerSummary(playerId);
    
    if (!summary.history || !Array.isArray(summary.history)) {
      return null;
    }

    const gameweekData = summary.history.find((h: any) => h.round === gameweek);
    
    if (!gameweekData) {
      return null;
    }

    return {
      gameweek: gameweekData.round,
      total_points: gameweekData.total_points || 0,
      minutes: gameweekData.minutes || 0,
      goals_scored: gameweekData.goals_scored || 0,
      assists: gameweekData.assists || 0,
      clean_sheets: gameweekData.clean_sheets || 0,
      goals_conceded: gameweekData.goals_conceded || 0,
      yellow_cards: gameweekData.yellow_cards || 0,
      red_cards: gameweekData.red_cards || 0,
      saves: gameweekData.saves || 0,
      bonus: gameweekData.bonus || 0,
      bps: gameweekData.bps || 0,
      influence: gameweekData.influence || '0.0',
      creativity: gameweekData.creativity || '0.0',
      threat: gameweekData.threat || '0.0',
      ict_index: gameweekData.ict_index || '0.0',
      starts: gameweekData.starts || 0,
      expected_goals: gameweekData.expected_goals || '0.0',
      expected_assists: gameweekData.expected_assists || '0.0',
      expected_goal_involvements: gameweekData.expected_goal_involvements || '0.0',
      expected_goals_conceded: gameweekData.expected_goals_conceded || '0.0',
      value: gameweekData.value || 0,
      transfers_balance: gameweekData.transfers_balance || 0,
      selected: gameweekData.selected || 0,
      transfers_in: gameweekData.transfers_in || 0,
      transfers_out: gameweekData.transfers_out || 0,
    };
  } catch (error) {
    console.error(`Error fetching points for player ${playerId} in gameweek ${gameweek}:`, error);
    return null;
  }
}

/**
 * Get all players with their points for a specific gameweek
 */
export async function getPlayersWithPoints(
  playerIds: number[],
  gameweek: number
): Promise<PlayerWithPoints[]> {
  const bootstrap = await fetchBootstrapStatic();
  const players: PlayerWithPoints[] = [];

  // Fetch all player points in parallel
  const pointsPromises = playerIds.map(async (playerId) => {
    const player = bootstrap.elements.find((p) => p.id === playerId);
    if (!player) return null;

    const points = await getPlayerPointsForGameweek(playerId, gameweek);

    return {
      ...player,
      gameweekPoints: points || undefined,
    };
  });

  const results = await Promise.all(pointsPromises);
  
  return results.filter((p): p is PlayerWithPoints => p !== null);
}


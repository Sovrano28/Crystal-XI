import { NextRequest, NextResponse } from 'next/server';
import { fetchTeamData, fetchTeamPicks, fetchBootstrapStatic, fetchTeamHistory } from '@/lib/fpl-api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const teamId = parseInt(id);

    if (isNaN(teamId)) {
      return NextResponse.json({ error: 'Invalid team ID' }, { status: 400 });
    }

    // Get current gameweek
    const bootstrap = await fetchBootstrapStatic();
    const currentEvent = bootstrap.events.find((event) => event.is_current);
    
    // Fetch general team data first - this has current team value and bank at root level
    const generalTeamData = await fetchTeamData(teamId);
    console.log(`[Team API] General team data FULL for team ${teamId}:`, JSON.stringify(generalTeamData, null, 2));
    
    // Try to get the most current entry_history from history endpoint
    let currentEntryHistory = null;
    try {
      currentEntryHistory = await fetchTeamHistory(teamId);
      if (currentEntryHistory) {
        console.log(`[Team API] History endpoint data for team ${teamId}:`, {
          value: currentEntryHistory.value,
          bank: currentEntryHistory.bank,
          event: currentEntryHistory.event,
        });
      }
    } catch (historyError) {
      console.error('Error fetching team history:', historyError);
    }
    
    // Build final entry_history: prioritize root values from general data (most current), then history endpoint
    let finalEntryHistory = null;
    
    // The /entry/{id}/ endpoint doesn't have current value/bank at root
    // It only has last_deadline_value and last_deadline_bank (from previous gameweek)
    // So we MUST use the history endpoint which has the most current values
    
    // First priority: Use history endpoint data (this has the CURRENT gameweek values)
    if (currentEntryHistory) {
      finalEntryHistory = currentEntryHistory;
      console.log(`[Team API] Using history endpoint data: value=${finalEntryHistory.value}, bank=${finalEntryHistory.bank}, event=${finalEntryHistory.event}`);
    }
    // Second priority: Use last_deadline values (not ideal, but better than nothing)
    else if (generalTeamData) {
      const lastDeadlineValue = (generalTeamData as any)?.last_deadline_value;
      const lastDeadlineBank = (generalTeamData as any)?.last_deadline_bank;
      if (lastDeadlineValue !== undefined || lastDeadlineBank !== undefined) {
        finalEntryHistory = {
          ...(generalTeamData.entry_history || {}),
          value: lastDeadlineValue ?? generalTeamData.entry_history?.value,
          bank: lastDeadlineBank ?? generalTeamData.entry_history?.bank,
          total_points: (generalTeamData as any)?.summary_overall_points ?? generalTeamData.entry_history?.total_points,
          overall_rank: (generalTeamData as any)?.summary_overall_rank ?? generalTeamData.entry_history?.overall_rank,
        };
        console.log(`[Team API] Using last_deadline values (fallback): value=${finalEntryHistory.value}, bank=${finalEntryHistory.bank}`);
      }
    }
    // Last resort: Use entry_history from general team data
    else if (generalTeamData?.entry_history) {
      finalEntryHistory = generalTeamData.entry_history;
      console.log(`[Team API] Using entry_history from general team data as fallback: value=${finalEntryHistory.value}, bank=${finalEntryHistory.bank}`);
    }
    
    console.log(`[Team API] Final entry_history for team ${teamId}:`, {
      value: finalEntryHistory?.value,
      bank: finalEntryHistory?.bank,
      event: finalEntryHistory?.event,
    });
    
    if (currentEvent) {
      // Fetch picks for current gameweek
      try {
        const picksData = await fetchTeamPicks(teamId, currentEvent.id);
        console.log(`[Team API] Picks data entry_history for team ${teamId}:`, {
          value: picksData.entry_history?.value,
          bank: picksData.entry_history?.bank,
          event: picksData.entry_history?.event,
        });
        
        // ALWAYS use finalEntryHistory (from history or general) - never use picks' entry_history
        // because picks' entry_history is for that specific gameweek, not current values
        if (!finalEntryHistory) {
          console.error(`[Team API] WARNING: finalEntryHistory is null for team ${teamId}! This should not happen.`);
          // As last resort, try to construct from general team data root values
          finalEntryHistory = {
            event: currentEvent.id,
            points: picksData.entry_history?.points || 0,
            total_points: generalTeamData?.summary_overall_points || picksData.entry_history?.total_points || 0,
            bank: generalTeamData?.bank ?? picksData.entry_history?.bank ?? 0,
            value: generalTeamData?.value ?? picksData.entry_history?.value ?? 0,
            rank: picksData.entry_history?.rank,
            rank_sort: picksData.entry_history?.rank_sort,
            overall_rank: generalTeamData?.summary_overall_rank || picksData.entry_history?.overall_rank,
            event_transfers: picksData.entry_history?.event_transfers || 0,
            event_transfers_cost: picksData.entry_history?.event_transfers_cost || 0,
            points_on_bench: picksData.entry_history?.points_on_bench || 0,
          };
          console.log(`[Team API] Constructed finalEntryHistory from root values:`, finalEntryHistory);
        }
        return NextResponse.json({
          ...picksData,
          entry_history: finalEntryHistory,
        });
      } catch (picksError) {
        // If picks fetch fails, return general team data with current entry_history
        console.error('Error fetching picks:', picksError);
        return NextResponse.json({
          ...generalTeamData,
          entry_history: finalEntryHistory,
          picks: [],
        });
      }
    }

    // If no current gameweek, return general team data with current entry_history
    return NextResponse.json({
      ...generalTeamData,
      entry_history: finalEntryHistory,
      picks: [],
    });
  } catch (error) {
    console.error('Error fetching team data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team data' },
      { status: 500 }
    );
  }
}


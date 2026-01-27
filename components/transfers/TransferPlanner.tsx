'use client';

import { useState, useMemo, useEffect } from 'react';
import { FPLTeamPicks, FPLPlayer, FPLBootstrapStatic, PlayerWithFixtures } from '@/types/fpl';
import { PitchView } from '@/components/planner/PitchView';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PlayerSearch } from './PlayerSearch';
import { TransferPreview } from './TransferPreview';
import { cn } from '@/lib/utils';

interface TransferPlannerProps {
  initialPicks: FPLTeamPicks;
  bootstrap: FPLBootstrapStatic;
  teamId: number;
}

export function TransferPlanner({ initialPicks, bootstrap, teamId }: TransferPlannerProps) {
  // State for the full 15-man squad
  // We initialize with null to indicate loading, then populate
  const [squad, setSquad] = useState<PlayerWithFixtures[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Transfer State
  // We simply track the current squad vs initial squad to calculate transfers
  const [initialSquad, setInitialSquad] = useState<PlayerWithFixtures[]>([]);
  
  // Derived state for transfers count/cost
  // (We'll implement simpler logic: count output - input differences)
  
  // Derived state for transfers count/cost
  // (We'll implement simpler logic: count output - input differences)
  
  const initialBank = initialPicks.entry_history.bank;
  const [bank, setBank] = useState(initialBank);

  // Fetch Fixtures on Mount
  useEffect(() => {
    async function loadSquadData() {
      try {
        setLoading(true);
        const playerIds = initialPicks.picks.map(p => p.element);
        
        const response = await fetch('/api/fpl/players-fixtures', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playerIds }),
        });

        if (!response.ok) throw new Error('Failed to fetch squad data');
        
        const data = await response.json();
        const players: PlayerWithFixtures[] = data.players || [];
        
        // Ensure we have 15 players (should match picks)
        // We map them back to the picks order or just use them
        // Picks have position, but API result might not. 
        // Let's assume API returns unsorted. We should sort by element_type for consistency?
        // Actually, PitchView sorts them.
        
        setSquad(players);
        setInitialSquad(players);
      } catch (err) {
        console.error("Error loading transfer planner data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSquadData();
  }, [initialPicks]);

  // Handle Remove Player
  const handleRemove = (playerId: number) => {
    setSquad(current => current.map(p => {
        if (p.id === playerId) {
            // Replace with Empty Slot Placeholder
            // We use negative ID to indicate empty
            // We preserve element_type to know what can replace it
            return {
                id: -Math.random(), // Unique negative ID
                web_name: 'Empty',
                element_type: p.element_type,
                team: -1,
                now_cost: 0,
                // Partial FPLPlayer props to satisfy type (minimally)
                first_name: '', second_name: '', points_per_game: '0', 
                selected_by_percent: '0', form: '0', news: '', 
                value_form: '0', value_season: '0', cost_change_start: 0,
                cost_change_event: 0, cost_change_start_fall: 0, cost_change_event_fall: 0,
                in_dreamteam: false, dreamteam_count: 0, photo: '',
                transfers_in: 0, transfers_out: 0, transfers_in_event: 0, transfers_out_event: 0,
                goals_scored: 0, assists: 0, clean_sheets: 0, goals_conceded: 0,
                own_goals: 0, penalties_saved: 0, penalties_missed: 0, yellow_cards: 0,
                red_cards: 0, saves: 0, bonus: 0, bps: 0, influence: '0',
                creativity: '0', threat: '0', ict_index: '0', starts: 0,
                expected_goals: '0', expected_assists: '0', expected_goal_involvements: '0',
                expected_goals_conceded: '0', influence_rank: 0, influence_rank_type: 0,
                creativity_rank: 0, creativity_rank_type: 0, threat_rank: 0, threat_rank_type: 0,
                ict_index_rank: 0, ict_index_rank_type: 0,
                upcomingFixtures: []
            } as PlayerWithFixtures;
        }
        return p;
    }));
  };

  // Handle Add Player (Select Replacement)
  const handleSelectReplacement = (playerIn: FPLPlayer) => {
    // Find a compatible empty slot
    const emptySlotIndex = squad.findIndex(p => p.id < 0 && p.element_type === playerIn.element_type);
    
    if (emptySlotIndex === -1) {
        alert(`No empty ${playerIn.element_type === 1 ? 'GK' : playerIn.element_type === 2 ? 'DEF' : playerIn.element_type === 3 ? 'MID' : 'FWD'} slots! Remove a player first.`);
        return;
    }

    // Check budget (optional warning)
    const currentTeamValue = squad.reduce((sum, p) => p.id > 0 ? sum + p.now_cost : sum, 0);
    // Note: This simple check doesn't account for selling price vs buying price logic (0.5 profit tax).
    // For MVP, we'll just check raw cost difference or warn loosely.
    
    // Replace slot
    const newSquad = [...squad];
    // Create new player object (we should ideally fetch fixtures, but for now just use basic info)
    const newPlayer = {
        ...playerIn,
        upcomingFixtures: [] // Will be blank for now, can implement single-fetch later
    } as PlayerWithFixtures;
    
    newSquad[emptySlotIndex] = newPlayer;
    setSquad(newSquad);
  };
  
  const handleReset = () => {
      setSquad(initialSquad);
  };

  // Calculate transfers made (naive implementation)
  const transfersCount = squad.filter(p => p.id > 0 && !initialSquad.some(init => init.id === p.id)).length;
  
  // Calculate Bank Balance
  const startingValue = initialPicks.entry_history.value; // Total team value
  // This is tricky without exact sell prices.
  // Approximation: Start Bank + (Outs Cost) - (Ins Cost).
  // Better: We track the delta.
  const initialSquadCost = initialSquad.reduce((sum, p) => sum + p.now_cost, 0);
  const currentSquadCost = squad.reduce((sum, p) => p.id > 0 ? sum + p.now_cost : sum, 0);
  const balance = initialBank + (initialSquadCost - currentSquadCost);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)]">
      {/* Left Column: Pitch View */}
      <div className="lg:col-span-8 flex flex-col gap-4">
        <TransferPreview 
            currentBank={initialBank}
            transfersCost={0} 
            transfersCount={transfersCount}
            freeTransfers={1}
            transfersOutValue={0} // TODO: Refine
            transfersInCost={0} // TODO: Refine
            remainingBank={balance}
        />
        
        {/* Warning if over budget */}
        {balance < 0 && (
             <div className="bg-red-500/10 border border-red-500/40 text-red-500 px-4 py-2 rounded-lg text-sm font-medium text-center">
                 Warning: You are over budget by £{Math.abs(balance/10).toFixed(1)}m
             </div>
        )}
        
        <Card className="flex-1 overflow-hidden relative" padding="none">
             <div className="absolute inset-0 overflow-auto custom-scrollbar">
                <div className="min-h-[600px] h-full p-4">
                    {loading ? (
                        <div className="flex items-center justify-center h-full text-[var(--foreground-muted)]">
                            Loading squad data...
                        </div>
                    ) : (
                        <PitchView 
                            players={squad}
                            teams={bootstrap.teams}
                            selectedGameweek={initialPicks.entry_history.event + 1}
                            showAllPlayers={true}
                            enableCaptaincyOptions={false}
                            onRemove={handleRemove}
                        />
                    )}
                </div>
             </div>
        </Card>
      </div>

      {/* Right Column: Player Search & Sidebar */}
      <div className="lg:col-span-4 flex flex-col gap-4 h-full overflow-hidden">
        <Card className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-[var(--surface-border)]">
                <h3 className="font-semibold text-[var(--foreground)]">Find Player</h3>
                <p className="text-xs text-[var(--foreground-muted)] mt-1">
                   Remove a player on the pitch, then select a replacement here.
                </p>
            </div>
            
            <div className="flex-1 overflow-hidden p-4">
                <PlayerSearch 
                    players={bootstrap.elements} 
                    onSelectPlayer={handleSelectReplacement}
                />
            </div>
        </Card>

        {transfersCount > 0 && (
            <Card padding="sm">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">Transfers Pending: {transfersCount}</h3>
                    <Button variant="ghost" size="sm" onClick={handleReset} className="text-red-500 hover:text-red-600">
                        Reset
                    </Button>
                </div>
                 <Button className="w-full mt-4" variant="glow">
                    Confirm Transfers
                </Button>
            </Card>
        )}
      </div>
    </div>
  );
}

'use client';

import { toast } from "sonner";

import { useState, useMemo, useEffect, useCallback } from 'react';
import { FPLTeamPicks, FPLPlayer, FPLBootstrapStatic, PlayerWithFixtures } from '@/types/fpl';
import { PitchView } from '@/components/planner/PitchView';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PlayerSearch } from './PlayerSearch';
import { TransferPreview } from './TransferPreview';
import { TransferPlanSelector } from './TransferPlanSelector';
import { SavePlanModal } from './SavePlanModal';
import { useTransferPlans } from '@/hooks/useTransferPlans';
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
  
  // Player prices state (playerId -> selling price in tenths)
  const [playerPrices, setPlayerPrices] = useState<Map<number, number>>(new Map());
  const [squadValue, setSquadValue] = useState<number>(0);
  

  
  // Transfer Plans Hook - persistent storage
  const {
    plans,
    activePlan,
    isLoading: plansLoading,
    createPlan,
    updatePlan,
    deletePlan,
    activatePlan,
    deactivateAll,
    addTransfer,
    removeTransfer,
  } = useTransferPlans();
  
  // Gameweek navigation state
  const initialGameweek = initialPicks.entry_history.event + 1;
  const [selectedGameweek, setSelectedGameweek] = useState(initialGameweek);
  const maxGameweek = 38; // FPL has 38 gameweeks
  const minGameweek = 1;
  
  const handlePrevWeek = () => {
    if (selectedGameweek > minGameweek) {
      setSelectedGameweek(prev => prev - 1);
    }
  };
  
  const handleNextWeek = () => {
    if (selectedGameweek < maxGameweek) {
      setSelectedGameweek(prev => prev + 1);
    }
  };

  // Search Filter State
  const [targetPosition, setTargetPosition] = useState<number | null>(null);

  // Handle Empty Slot Click from PitchView
  const handleEmptySlotClick = useCallback((position: number) => {
    // position is 1=GK, 2=DEF, 3=MID, 4=FWD
    setTargetPosition(position);
    
    // Scroll to player search container on mobile/small screens
    // We add a small delay to ensure state update propagates if needed, 
    // though React state updates are batched, the DOM scroll is independent.
    setTimeout(() => {
        const searchElement = document.getElementById('player-search-container');
        if (searchElement) {
            searchElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 100);
  }, []);

  const initialBank = initialPicks.entry_history.bank;

  // Fetch Fixtures and Prices on Mount
  useEffect(() => {
    async function loadSquadData() {
      try {
        setLoading(true);
        const playerIds = initialPicks.picks.map(p => p.element);
        
        // Fetch fixtures and squad value in parallel
        const [fixturesRes, teamRes] = await Promise.all([
          fetch('/api/fpl/players-fixtures', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playerIds }),
          }),
          fetch(`/api/fpl/team/${teamId}`), // This now includes squadValue calculation
        ]);

        if (!fixturesRes.ok) throw new Error('Failed to fetch squad data');
        
        const fixturesData = await fixturesRes.json();
        const players: PlayerWithFixtures[] = fixturesData.players || [];
        
        setSquad(players);
        setInitialSquad(players);
        
        // Extract squad value and player price breakdown from API
        if (teamRes.ok) {
          const teamData = await teamRes.json();
          
          // Use the accurate player price breakdown from the API
          // This uses actual transfer history to calculate correct selling prices
          const pricesMap = new Map<number, number>();
          const breakdown = teamData.playerPriceBreakdown || [];
          
          for (const item of breakdown) {
            if (item.playerId > 0 && item.sellingPrice !== undefined) {
              pricesMap.set(item.playerId, item.sellingPrice);
            }
          }
          
          // Fallback: If API didn't provide breakdown, try to calculate (less accurate)
          if (pricesMap.size === 0 && players.length > 0) {
            console.warn('[TransferPlanner] No playerPriceBreakdown from API, using fallback calculation');
            for (const player of players) {
              if (player.id > 0) {
                // This is less accurate - only use as fallback
                pricesMap.set(player.id, player.now_cost);
              }
            }
          }
          
          setPlayerPrices(pricesMap);
          
          // Debug logging
          console.log('[TransferPlanner] playerPrices map size:', pricesMap.size);
          pricesMap.forEach((price, playerId) => {
            console.log(`[TransferPlanner] Player ${playerId}: selling price = £${(price/10).toFixed(1)}m`);
          });
        }
        
        // Calculate Squad Value as sum of CURRENT prices (now_cost)
        // FPL's "Squad Value" display shows Team Value (sum of current prices),
        // NOT the sum of selling prices - verified by manual calculation
        const teamValue = players.reduce((sum, p) => sum + (p.now_cost || 0), 0);
        setSquadValue(teamValue);
        console.log('[TransferPlanner] Team Value (Squad Value display):', teamValue / 10, 'm');
      } catch (err) {
        console.error("Error loading transfer planner data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSquadData();
  }, [initialPicks, teamId]);

  // Sync Squad with Active Plan
  useEffect(() => {
    if (!initialSquad.length || !bootstrap.elements) return;

    if (activePlan) {
        setLoading(true);
        // Start with clean initial squad
        const newSquad = [...initialSquad];

        // Apply transfers from plan
        activePlan.transfers.forEach(t => {
            const idx = newSquad.findIndex(p => p.id === t.playerOut);
            if (idx !== -1) {
                const playerIn = bootstrap.elements.find(p => p.id === t.playerIn);
                
                if (playerIn) {
                     // Create player with correct selling price (purchase price from plan)
                     // Note: We don't have fixture data here yet, strictly. 
                     //Ideally we'd fetch it, but for now we use the basic object.
                     const newPlayer = {
                         ...playerIn,
                         upcomingFixtures: [], // TODO: These should be fetched/merged
                     } as unknown as PlayerWithFixtures;
                     
                     // If we have price info in plan, we could use it, but for consistency 
                     // with the rest of the app, maybe we stick to current prices or what's expected?
                     // The plan has purchasePrice.
                     
                     newSquad[idx] = newPlayer;
                }
            }
        });
        setSquad(newSquad);
        setLoading(false);
    } else {
        // No active plan - revert to initial squad
        // (Or keep current state if we want "unsaved draft" behavior, but simply resetting ensures consistency)
        if (squad.length === 0) {
            setSquad(initialSquad);
        }
        setLoading(false);
    }
  }, [activePlan, initialSquad, bootstrap, squad.length]);

  // Handle Remove Player
  const handleRemove = async (playerId: number) => {
    // 1. Identify who is being removed (Original ID)
    let originalId = playerId;
    
    // If it's a planned transfer player, we need to find who they replaced
    if (activePlan) {
        const plannedTransfer = activePlan.transfers.find(t => t.playerIn === playerId);
        if (plannedTransfer) {
            originalId = plannedTransfer.playerOut;
            // If we remove a transferred-in player, we are reverting that transfer in the plan
            await removeTransfer(activePlan._id!, originalId);
            return; // The useEffect will handle the update
        }
    } else {
         // Local mode (no plan) - use slot index to get original owner
         // (handles case when removing an "added" player - we need the slot's original)
    }

    // 2. Visual Update (Optimistic / Local)
    setSquad(current => {
        const slotIndex = current.findIndex(p => p.id === playerId);
        const slotOriginalId = slotIndex !== -1 ? initialSquad[slotIndex]?.id : undefined;
        const effectiveOriginalId = slotOriginalId ?? originalId;
        return current.map(p => {
        if (p.id === playerId) {
            // Use negative Original ID to track the slot owner
            return {
                id: -effectiveOriginalId, // Store original ID as negative
                web_name: 'Empty',
                element_type: p.element_type,
                team: -1,
                now_cost: 0,
                // Partial props
                first_name: '', second_name: '', total_points: 0, points_per_game: '0', 
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
        });
    });
  };

  // Handle Add Player (Select Replacement)
  const handleSelectReplacement = async (playerIn: FPLPlayer) => {
    // Find compatible empty slot
    const emptySlotIndex = squad.findIndex(p => p.id < 0 && p.element_type === playerIn.element_type);
    
    if (emptySlotIndex === -1) {
        toast.error(`No empty ${playerIn.element_type === 1 ? 'GK' : playerIn.element_type === 2 ? 'DEF' : playerIn.element_type === 3 ? 'MID' : 'FWD'} slots! Remove a player first.`);
        return;
    }

    const emptySlot = squad[emptySlotIndex];
    const originalId = Math.abs(emptySlot.id); // Recover original ID

    if (activePlan) {
        // Persistent Mode: Add to Plan
        const sellPrice = playerPrices.get(originalId) ?? 0;
        await addTransfer(activePlan._id!, {
            playerOut: originalId,
            playerIn: playerIn.id,
            sellingPrice: sellPrice,
            purchasePrice: playerIn.now_cost
        });
        // useEffect will sync state
    } else {
        // Local Mode: Update State directly
        const newSquad = [...squad];
        const newPlayer = {
            ...playerIn,
            upcomingFixtures: [] 
        } as unknown as PlayerWithFixtures;
        newSquad[emptySlotIndex] = newPlayer;
        setSquad(newSquad);
    }
    
    // Fetch fixtures for the new player (or all plan players) to avoid "BGW"
    // We do this optimistically after setting state
    try {
        const playerIds = [playerIn.id];
        const res = await fetch('/api/fpl/players-fixtures', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playerIds }),
        });
        if (res.ok) {
            const data = await res.json();
            const playerWithFixtures = data.players[0];
            if (playerWithFixtures) {
                setSquad(current => current.map(p => 
                    p.id === playerIn.id ? playerWithFixtures : p
                ));
            }
        }
    } catch (err) {
        console.error("Failed to fetch fixtures for new player:", err);
    }
  };
  
  // Modal State
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [pendingTransfers, setPendingTransfers] = useState<{ playerOut: number, playerIn: number, sellingPrice: number, purchasePrice: number }[]>([]);

  const handleConfirmTransfers = () => {
      if (!activePlan) {
          // Identify transfers made in Local Mode
          const transfersToAdd: { playerOut: number, playerIn: number, sellingPrice: number, purchasePrice: number }[] = [];
          
          const positions = [1, 2, 3, 4];
          
          for (const pos of positions) {
              const removed = initialSquad.filter(p => !squad.some(s => s.id === p.id) && p.element_type === pos);
              const added = squad.filter(p => !initialSquad.some(i => i.id === p.id) && p.element_type === pos && p.id > 0);
              
              const count = Math.min(removed.length, added.length);
              for (let i = 0; i < count; i++) {
                  const pOut = removed[i];
                  const pIn = added[i];
                  const sellPrice = playerPrices.get(pOut.id) ?? pOut.now_cost;
                  
                  transfersToAdd.push({
                      playerOut: pOut.id,
                      playerIn: pIn.id,
                      purchasePrice: pIn.now_cost,
                      sellingPrice: sellPrice || 0
                  });
              }
          }

          if (transfersToAdd.length === 0) {
              toast.error("No completed transfers to save. Please replace removed players.");
              return;
          }

          setPendingTransfers(transfersToAdd);
          setIsSaveModalOpen(true);
      }
  };

  const handleSavePlan = async (planName: string) => {
      try {
          const gwToUse = initialGameweek || 1; 
          const newPlan = await createPlan(planName, gwToUse);
          
          if (!newPlan || !newPlan._id) {
              toast.error("Failed to create plan. Please try again.");
              return;
          }

          const updatedPlan = await updatePlan(newPlan._id, { transfers: pendingTransfers });
          
          if (updatedPlan) {
              await activatePlan(newPlan._id);
              toast.success("Plan saved and activated!");
          } else {
              toast.error("Plan created but failed to save transfers.");
          }
      } catch (error) {
          console.error("Error saving plan:", error);
          toast.error("An error occurred while saving the plan.");
      }
  };
  
  const handleReset = async () => {
      if (activePlan) {
          await deactivateAll();
      } else {
          setSquad(initialSquad);
      }
  };

  // Plan Management Wrappers
  const handleCreatePlan = async (name: string, gameweek: number) => {
      await createPlan(name, gameweek);
  };
  const handleSelectPlan = async (planId: string) => {
      await activatePlan(planId);
  };
  const handleDeletePlan = async (planId: string) => {
      await deletePlan(planId);
  };
  const handleDeactivate = async () => {
      await deactivateAll();
  };

  // Calculate stats based on Active Plan vs Local State
  const transfersCount = activePlan 
      ? activePlan.transfers.length 
      : squad.filter(p => p.id > 0 && !initialSquad.some(init => init.id === p.id)).length;
  
  // Calculate Bank Balance
  let balance = initialBank;
  if (activePlan) {
      const spend = activePlan.transfers.reduce((sum, t) => sum + t.purchasePrice, 0);
      const gain = activePlan.transfers.reduce((sum, t) => sum + t.sellingPrice, 0);
      balance = initialBank + gain - spend;
  } else {
      // Local approximation
      const removedPlayers = initialSquad.filter(init => !squad.some(curr => curr.id === init.id));
      const addedPlayers = squad.filter(curr => curr.id > 0 && !initialSquad.some(init => init.id === curr.id));
      
      const gain = removedPlayers.reduce((sum, p) => sum + (playerPrices.get(p.id) ?? p.now_cost), 0);
      const spend = addedPlayers.reduce((sum, p) => sum + p.now_cost, 0);
      
      balance = initialBank + gain - spend;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)]">
      <SavePlanModal 
        isOpen={isSaveModalOpen} 
        onClose={() => setIsSaveModalOpen(false)} 
        onSave={handleSavePlan}
        defaultName={`Plan ${plans.length + 1}`}
      />
      {/* Left Column: Pitch View */}
      <div className="lg:col-span-8 flex flex-col gap-4">
        {/* Top Control Bar: Plans & Stats */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <TransferPlanSelector 
                plans={plans}
                activePlan={activePlan}
                currentGameweek={initialGameweek}
                isLoading={plansLoading}
                onCreatePlan={handleCreatePlan}
                onSelectPlan={handleSelectPlan}
                onDeletePlan={handleDeletePlan}
                onDeactivate={handleDeactivate}
            />
            
            <TransferPreview 
                currentBank={initialBank}
                transfersCost={
                    (activePlan?.chipUsed === 'wildcard' || activePlan?.chipUsed === 'freehit') 
                    ? 0 
                    : Math.max(0, (transfersCount - 1) * 4)
                } 
                transfersCount={transfersCount}
                freeTransfers={1}
                transfersOutValue={0}
                transfersInCost={0}
                remainingBank={balance}
                squadValue={squadValue}
            />
        </div>
        
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
                            selectedGameweek={selectedGameweek}
                            showAllPlayers={true}
                            enableCaptaincyOptions={false}
                            onRemove={handleRemove}
                            playerPrices={playerPrices}
                            floatingNav={true}
                            onPrevWeek={handlePrevWeek}
                            onNextWeek={handleNextWeek}
                            canGoPrev={selectedGameweek > minGameweek}
                            canGoNext={selectedGameweek < maxGameweek}
                            onEmptySlotClick={handleEmptySlotClick}
                        />
                    )}
                </div>
             </div>
        </Card>
      </div>

      {/* Right Column: Player Search & Sidebar */}
      <div className="lg:col-span-4 flex flex-col gap-4 h-full overflow-y-auto" id="player-search-container">
        <Card className="flex-1 flex flex-col overflow-hidden min-h-[420px]">
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
                    initialPositionFilter={targetPosition}
                />
            </div>
        </Card>

        {transfersCount > 0 && (
            <Card padding="sm" className="flex-shrink-0">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">Transfers Pending: {transfersCount}</h3>
                    <Button variant="ghost" size="sm" onClick={handleReset} className="text-red-500 hover:text-red-600">
                        {activePlan ? 'Deactivate Plan' : 'Reset'}
                    </Button>
                </div>
                {/* Confirm button only for local mode or explicit save? 
                    For persistent plan, changes are auto-saved. 
                    Maybe hide "Confirm"? Or change to "Go to Planner"? */}
                 <Button 
                    className="w-full mt-4" 
                    variant="glow" 
                    disabled={activePlan !== null}
                    onClick={handleConfirmTransfers}
                 >
                    {activePlan ? 'Changes Auto-Saved' : 'Confirm & Save as Plan'}
                </Button>
            </Card>
        )}
      </div>
    </div>
  );
}

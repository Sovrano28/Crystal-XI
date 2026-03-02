import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FPLPlayer, FPLTeam } from '@/types/fpl';

export type CompareMode = 'players' | 'teams';

export interface SavedComparison {
  id: string;
  name: string;
  mode: CompareMode;
  itemIds: number[];
  createdAt: number;
}

interface CompareState {
  mode: CompareMode;
  selectedPlayers: FPLPlayer[];
  selectedTeams: FPLTeam[];
  maxSelected: number;
  savedComparisons: SavedComparison[];
  
  // Actions
  setMode: (mode: CompareMode) => void;
  addPlayer: (player: FPLPlayer) => void;
  removePlayer: (playerId: number) => void;
  addTeam: (team: FPLTeam) => void;
  removeTeam: (teamId: number) => void;
  clearAll: () => void;
  setMaxSelected: (max: number) => void;
  
  saveComparison: (name: string) => void;
  loadComparison: (id: string, allPlayers: FPLPlayer[], allTeams: FPLTeam[]) => void;
  deleteComparison: (id: string) => void;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      mode: 'players',
      selectedPlayers: [],
      selectedTeams: [],
      maxSelected: 5, // Default for desktop, responsive logic can adjust
      savedComparisons: [],

      setMode: (mode) => set({ mode }),
      
      addPlayer: (player) => {
        const { selectedPlayers, maxSelected } = get();
        if (selectedPlayers.find(p => p.id === player.id)) return; // Already exists
        
        // If we've hit the limit, replace the oldest one (FIFO)
        const newPlayers = selectedPlayers.length >= maxSelected 
          ? [...selectedPlayers.slice(1), player] 
          : [...selectedPlayers, player];
          
        set({ selectedPlayers: newPlayers });
      },
      
      removePlayer: (playerId) => {
        set(state => ({
          selectedPlayers: state.selectedPlayers.filter(p => p.id !== playerId)
        }));
      },
      
      addTeam: (team) => {
        const { selectedTeams, maxSelected } = get();
        if (selectedTeams.find(t => t.id === team.id)) return; // Already exists
        
        const newTeams = selectedTeams.length >= maxSelected 
          ? [...selectedTeams.slice(1), team] 
          : [...selectedTeams, team];
          
        set({ selectedTeams: newTeams });
      },
      
      removeTeam: (teamId) => {
        set(state => ({
          selectedTeams: state.selectedTeams.filter(t => t.id !== teamId)
        }));
      },
      
      clearAll: () => set({ selectedPlayers: [], selectedTeams: [] }),
      
      setMaxSelected: (maxSelected) => set({ maxSelected }),
      
      saveComparison: (name) => {
        const { mode, selectedPlayers, selectedTeams, savedComparisons } = get();
        const itemIds = mode === 'players' ? selectedPlayers.map(p => p.id) : selectedTeams.map(t => t.id);
        
        if (itemIds.length === 0) return; // Note doing nothing if empty
        
        const newSaved: SavedComparison = {
          id: Math.random().toString(36).substring(2, 10),
          name,
          mode,
          itemIds,
          createdAt: Date.now()
        };
        
        set({ savedComparisons: [...savedComparisons, newSaved] });
      },
      
      loadComparison: (id, allPlayers, allTeams) => {
        const { savedComparisons } = get();
        const target = savedComparisons.find(c => c.id === id);
        if (!target) return;
        
        if (target.mode === 'players') {
          const playersToLoad = target.itemIds.map(pid => allPlayers.find(p => p.id === pid)).filter(Boolean) as FPLPlayer[];
          set({ mode: 'players', selectedPlayers: playersToLoad, selectedTeams: [] });
        } else {
          const teamsToLoad = target.itemIds.map(tid => allTeams.find(t => t.id === tid)).filter(Boolean) as FPLTeam[];
          set({ mode: 'teams', selectedTeams: teamsToLoad, selectedPlayers: [] });
        }
      },
      
      deleteComparison: (id) => {
        set(state => ({ savedComparisons: state.savedComparisons.filter(c => c.id !== id) }));
      }
    }),
    {
      name: 'crystal-xi-compare-storage',
      partialize: (state) => ({ savedComparisons: state.savedComparisons }), // Only persist savedComparisons
    }
  )
);

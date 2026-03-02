'use client';

import React, { useEffect, useState } from 'react';
import { FPLPlayer, FPLTeam, FPLFixture, PlayerWithFixtures } from '@/types/fpl';
import { useCompareStore } from '@/lib/hooks/useCompareStore';
import { CompareSearch } from './CompareSearch';
import { PlayerCompareCard } from './PlayerCompareCard';
import { TeamCompareCard } from './TeamCompareCard';
import { CompareChart } from './CompareChart';
import { SavedComparisons } from './SavedComparisons';
import { getPlayerFixtures } from '@/lib/fpl-api';

interface CompareClientProps {
  players: FPLPlayer[];
  teams: FPLTeam[];
  fixtures: FPLFixture[];
  currentGameweek: number;
}

export function CompareClient({ players, teams, fixtures, currentGameweek }: CompareClientProps) {
  const { mode, setMode, selectedPlayers, selectedTeams, setMaxSelected } = useCompareStore();
  
  // Track window width to adjust max selections
  useEffect(() => {
    const handleResize = () => {
      setMaxSelected(window.innerWidth < 768 ? 3 : 5);
    };
    
    // Initial check
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setMaxSelected]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      {/* Header & Mode Toggle */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-8 pt-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2">Compare Head-to-Head</h1>
          <p className="text-slate-500 dark:text-slate-400">Analyze underlying stats and fixtures side-by-side.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <SavedComparisons players={players} teams={teams} />
          
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shadow-inner shrink-0">
            <button
              onClick={() => setMode('players')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                mode === 'players' 
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              Players
            </button>
            <button
              onClick={() => setMode('teams')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                mode === 'teams' 
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              Teams
            </button>
          </div>
        </div>
      </div>

      {/* Search Area */}
      <div className="mb-10">
        <CompareSearch players={players} teams={teams} />
      </div>

      {/* Main Content Area */}
      {((mode === 'players' && selectedPlayers.length > 0) || (mode === 'teams' && selectedTeams.length > 0)) ? (
        <div className="flex flex-col gap-10">
          
          {/* Comparison Cards Grid */}
          <div className="w-full flex overflow-x-auto pb-6 snap-x snap-mandatory gap-4 md:gap-6 hide-scrollbar items-stretch">
            {mode === 'players' ? (
              selectedPlayers.map(player => {
                const team = teams.find(t => t.id === player.team);
                const playerFixtures = getPlayerFixtures(player.id, player.team, fixtures, teams, currentGameweek);
                
                return (
                  <PlayerCompareCard 
                    key={`pc-${player.id}`} 
                    player={player} 
                    teamShortName={team?.short_name || ''} 
                    fixtures={playerFixtures} 
                  />
                );
              })
            ) : (
              selectedTeams.map(team => {
                const teamFixtures = fixtures.filter(f => 
                  f.event !== null && f.event >= currentGameweek && !f.finished && 
                  (f.team_h === team.id || f.team_a === team.id)
                ).sort((a, b) => (a.event || 0) - (b.event || 0)).map(f => {
                   const isHome = f.team_h === team.id;
                   const opponentId = isHome ? f.team_a : f.team_h;
                   const opponent = teams.find(t => t.id === opponentId) || teams[0];
                   return {
                      gameweek: f.event || currentGameweek,
                      opponent,
                      isHome,
                      difficulty: isHome ? f.team_h_difficulty : f.team_a_difficulty,
                      fixture: f
                   };
                });
                
                const teamPlayers = players.filter(p => p.team === team.id);

                return (
                  <TeamCompareCard 
                    key={`tc-${team.id}`} 
                    team={team} 
                    fixtures={teamFixtures}
                    players={teamPlayers}
                  />
                );
              })
            )}
            
            {/* Empty State placeholder if < max */}
            {mode === 'players' && selectedPlayers.length < (window.innerWidth < 768 ? 3 : 5) && (
              <div className="w-[280px] md:w-[320px] shrink-0 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex items-center justify-center p-8 text-center text-slate-400 dark:text-slate-500 snap-center min-h-[300px]">
                <p>Search to add another player<br/>for comparison</p>
              </div>
            )}
            {mode === 'teams' && selectedTeams.length < (window.innerWidth < 768 ? 3 : 5) && (
              <div className="w-[280px] md:w-[320px] shrink-0 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex items-center justify-center p-8 text-center text-slate-400 dark:text-slate-500 snap-center min-h-[300px]">
                <p>Search to add another team<br/>for comparison</p>
              </div>
            )}
          </div>

          {/* Bar Chart */}
          <div className="w-full">
            <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200 px-2">Key Metrics Comparison</h3>
            <CompareChart mode={mode} selectedPlayers={selectedPlayers} selectedTeams={selectedTeams} allPlayers={players} />
          </div>

        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-24 h-24 mb-6 rounded-full bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center">
            <svg className="w-10 h-10 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No {mode} selected</h3>
          <p className="text-slate-500 max-w-md">Search and select up to 5 {mode} to see their underlying stats and fixtures compared side-by-side.</p>
        </div>
      )}
    </div>
  );
}

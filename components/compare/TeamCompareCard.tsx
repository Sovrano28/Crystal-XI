'use client';

import React from 'react';
import { X } from 'lucide-react';
import { FPLTeam, FPLPlayer, PlayerFixture } from '@/types/fpl';
import { useCompareStore } from '@/lib/hooks/useCompareStore';
import { FixtureDifficultyGrid } from './FixtureDifficultyGrid';

interface TeamCompareCardProps {
  team: FPLTeam;
  fixtures?: PlayerFixture[];
  players?: FPLPlayer[];
}

export function TeamCompareCard({ team, fixtures, players }: TeamCompareCardProps) {
  const { removeTeam } = useCompareStore();

  const parseOrZero = (val: string | number | undefined) => {
    if (val === undefined) return '0.00';
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  const totalXg = players ? players.reduce((sum, p) => sum + parseFloat(p.expected_goals || '0'), 0) : 0;
  const totalXa = players ? players.reduce((sum, p) => sum + parseFloat(p.expected_assists || '0'), 0) : 0;
  const totalGoals = players ? players.reduce((sum, p) => sum + (p.goals_scored || 0), 0) : 0;
  const maxCleanSheets = players ? Math.max(0, ...players.map(p => p.clean_sheets || 0)) : 0;

  return (
    <div className="relative group w-[280px] md:w-[320px] shrink-0 bg-white/70 dark:bg-slate-900/60 rounded-3xl overflow-hidden border border-slate-200/50 dark:border-slate-800 backdrop-blur-xl shadow-sm hover:shadow-xl transition-all duration-300 transform md:hover:-translate-y-2 snap-center">
      
      {/* Remove Button */}
      <button 
        onClick={() => removeTeam(team.id)}
        className="absolute top-4 right-4 z-10 p-2 bg-black/10 dark:bg-white/10 hover:bg-rose-500 hover:text-white rounded-full transition-colors opacity-0 group-hover:opacity-100"
      >
        <X size={16} />
      </button>

      {/* Header / Logo */}
      <div className="relative h-32 bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex flex-col items-center justify-center border-b border-slate-100 dark:border-slate-800">
        <img 
          src={`https://resources.premierleague.com/premierleague/badges/t${team.code}.png`}
          alt={team.name}
          className="w-20 h-20 object-contain drop-shadow-xl z-10"
          onError={(e) => {
             (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>

      <div className="p-5 pt-6">
        <div className="text-center mb-6">
           <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">{team.name}</h3>
           <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mt-2">{team.short_name}</p>
        </div>

        {/* Fixtures Row */}
        <div className="mb-6 space-y-1">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-1">Next 5 Fixtures</p>
          <div className="h-10 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-1">
             {fixtures && fixtures.length > 0 ? (
               <FixtureDifficultyGrid fixtures={fixtures} maxFixtures={5} />
             ) : (
               <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">Loading...</div>
             )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
           <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl flex flex-col items-center">
             <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Goals</span>
             <span className="text-lg font-black text-slate-900 dark:text-white">{totalGoals}</span>
           </div>
           <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl flex flex-col items-center">
             <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Clean Sheets</span>
             <span className="text-lg font-black text-slate-900 dark:text-white">{maxCleanSheets}</span>
           </div>
        </div>

        {/* Aggregate Stats */}
        <div className="space-y-3">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-1 border-b border-slate-100 dark:border-slate-800 pb-1">Underlying Stats (Cumulative)</p>
          
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-slate-600 dark:text-slate-300">Total Exp. Goals (xG)</span>
            <span className="font-bold text-slate-900 dark:text-white bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded text-xs">{totalXg.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-slate-600 dark:text-slate-300">Total Exp. Assists (xA)</span>
            <span className="font-bold text-slate-900 dark:text-white bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded text-xs">{totalXa.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between items-center text-sm p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl mt-4">
            <span className="font-bold text-indigo-700 dark:text-indigo-300">Overall Strength</span>
            <span className="font-black text-indigo-900 dark:text-white text-lg">
               {Math.round((team.strength_overall_home + team.strength_overall_away) / 2)}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}

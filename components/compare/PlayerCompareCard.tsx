'use client';

import React from 'react';
import { X } from 'lucide-react';
import { FPLPlayer, PlayerFixture } from '@/types/fpl';
import { useCompareStore } from '@/lib/hooks/useCompareStore';
import { getPlayerInjuryStatus } from '@/lib/utils/injury-flags';
import { FixtureDifficultyGrid } from './FixtureDifficultyGrid';

interface PlayerCompareCardProps {
  player: FPLPlayer;
  teamShortName: string;
  fixtures?: PlayerFixture[];
}

export function PlayerCompareCard({ player, teamShortName, fixtures }: PlayerCompareCardProps) {
  const { removePlayer } = useCompareStore();

  const parseOrZero = (val: string | number | undefined) => {
    if (val === undefined) return '0.00';
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  const injuryStatus = getPlayerInjuryStatus(player);
  
  // Dynamic header backgrounds based on injury status
  const headerBgClasses = {
    red: 'bg-gradient-to-br from-rose-50/80 to-rose-200/80 dark:from-rose-900/40 dark:to-rose-950/40 border-b border-rose-200 dark:border-rose-800',
    orange: 'bg-gradient-to-br from-orange-50/80 to-orange-200/80 dark:from-orange-900/40 dark:to-orange-950/40 border-b border-orange-200 dark:border-orange-800',
    yellow: 'bg-gradient-to-br from-yellow-50/80 to-yellow-200/80 dark:from-yellow-900/40 dark:to-yellow-950/40 border-b border-yellow-200 dark:border-yellow-800',
    none: 'bg-gradient-to-br from-indigo-50 to-white dark:from-slate-800 dark:to-slate-900 border-b border-slate-100 dark:border-slate-800'
  };

  const statusTextClasses = {
    red: 'text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/50',
    orange: 'text-orange-700 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/50',
    yellow: 'text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/50',
    none: ''
  };

  return (
    <div className="relative group w-[280px] md:w-[320px] shrink-0 bg-white/70 dark:bg-slate-900/60 rounded-3xl overflow-hidden border border-slate-200/50 dark:border-slate-800 backdrop-blur-xl shadow-sm hover:shadow-xl transition-all duration-300 transform md:hover:-translate-y-2 snap-center">
      
      {/* Remove Button */}
      <button 
        onClick={() => removePlayer(player.id)}
        className="absolute top-4 right-4 z-10 p-2 bg-black/10 dark:bg-white/10 hover:bg-rose-500 hover:text-white rounded-full transition-colors opacity-0 group-hover:opacity-100"
      >
        <X size={16} />
      </button>

      {/* Header / Photo */}
      <div className={`relative h-40 flex flex-col items-center justify-end ${headerBgClasses[injuryStatus.color]}`}>
        <div className="absolute top-4 left-4 text-xs font-bold px-2 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 rounded-md">
           £{(player.now_cost / 10).toFixed(1)}m
        </div>
        
        {injuryStatus.color !== 'none' && (
          <div className={`absolute top-4 right-14 text-[10px] font-bold px-2 py-1 rounded-md max-w-[120px] truncate ${statusTextClasses[injuryStatus.color]}`} title={injuryStatus.message}>
            {injuryStatus.shortMessage}
          </div>
        )}
        <img 
          src={`https://resources.premierleague.com/premierleague/photos/players/110x140/p${player.photo.replace('.jpg', '.png')}`}
          alt={player.web_name}
          className="w-28 h-auto object-cover drop-shadow-xl translate-y-2 z-10"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/placeholder-player.png';
          }}
        />
      </div>

      <div className="p-5 pt-6">
        <div className="text-center mb-5">
           <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">{player.web_name}</h3>
           <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">{player.first_name} {player.second_name}</p>
           <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mt-2">{teamShortName}</p>
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

        {/* Core Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
           <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl flex flex-col items-center">
             <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Pts</span>
             <span className="text-lg font-black text-slate-900 dark:text-white">{player.total_points}</span>
           </div>
           <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl flex flex-col items-center">
             <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pts/Game</span>
             <span className="text-lg font-black text-slate-900 dark:text-white">{player.points_per_game}</span>
           </div>
        </div>

        {/* Advanced Stats */}
        <div className="space-y-3">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-1 border-b border-slate-100 dark:border-slate-800 pb-1">Underlying Stats (per 90)</p>
          
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-slate-600 dark:text-slate-300">Expected Goals (xG)</span>
            <span className="font-bold text-slate-900 dark:text-white bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded text-xs">{parseOrZero(player.expected_goals_per_90 || player.expected_goals)}</span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-slate-600 dark:text-slate-300">Expected Assists (xA)</span>
            <span className="font-bold text-slate-900 dark:text-white bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded text-xs">{parseOrZero(player.expected_assists_per_90 || player.expected_assists)}</span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-slate-600 dark:text-slate-300">Exp. Goal Inv. (xGI)</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded text-xs">
              {parseOrZero(player.expected_goal_involvements_per_90 || player.expected_goal_involvements)}
            </span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-slate-600 dark:text-slate-300">Exp. Goals Conc. (xGC)</span>
            <span className="font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 px-2 py-0.5 rounded text-xs">{parseOrZero(player.expected_goals_conceded_per_90 || player.expected_goals_conceded)}</span>
          </div>
        </div>

      </div>
    </div>
  );
}

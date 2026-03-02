'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { FPLPlayer, FPLTeam } from '@/types/fpl';
import { useCompareStore } from '@/lib/hooks/useCompareStore';
import { PlayerInjuryIcon } from '@/components/ui/PlayerInjuryIcon';

interface CompareSearchProps {
  players: FPLPlayer[];
  teams: FPLTeam[];
}

export function CompareSearch({ players, teams }: CompareSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { mode, addPlayer, addTeam } = useCompareStore();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredResults = useMemo(() => {
    if (query.trim() === '') return [];
    
    const lowerQuery = query.toLowerCase();
    
    if (mode === 'players') {
      return players
        .filter(p => 
          p.web_name.toLowerCase().includes(lowerQuery) || 
          p.first_name.toLowerCase().includes(lowerQuery) || 
          p.second_name.toLowerCase().includes(lowerQuery)
        )
        .slice(0, 8); // Max 8 results
    } else {
      return teams
        .filter(t => 
          t.name.toLowerCase().includes(lowerQuery) || 
          t.short_name.toLowerCase().includes(lowerQuery)
        )
        .slice(0, 8);
    }
  }, [query, mode, players, teams]);

  const handleSelect = (item: FPLPlayer | FPLTeam) => {
    if (mode === 'players') {
      addPlayer(item as FPLPlayer);
    } else {
      addTeam(item as FPLTeam);
    }
    setQuery('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  return (
    <div className="relative w-full max-w-md mx-auto z-50" ref={containerRef}>
      <div className="relative flex items-center">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          className="block w-full pl-10 pr-10 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-shadow dark:text-slate-200 placeholder-slate-400"
          placeholder={`Search for a ${mode === 'players' ? 'player' : 'team'} to compare...`}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (query.trim() !== '') setIsOpen(true);
          }}
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {isOpen && filteredResults.length > 0 && (
        <div className="absolute mt-2 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden flex flex-col max-h-80 overflow-y-auto">
          {filteredResults.map((item) => {
            if (mode === 'players') {
              const player = item as FPLPlayer;
              const playerTeam = teams.find(t => t.id === player.team);
              return (
                <button
                  key={`player-${player.id}`}
                  onClick={() => handleSelect(player)}
                  className="flex items-center w-full px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700/50 last:border-0 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden mr-3 shrink-0 flex items-center justify-center">
                    <img 
                      src={`https://resources.premierleague.com/premierleague/photos/players/40x40/p${player.photo.replace('.jpg', '.png')}`}
                      alt={player.web_name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/placeholder-player.png';
                      }}
                    />
                  </div>
                  <div>
                    <div className="font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      {player.first_name} {player.second_name}
                      <PlayerInjuryIcon player={player} size="sm" />
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <span className="font-semibold">{playerTeam?.short_name}</span>
                      <span>£{(player.now_cost / 10).toFixed(1)}m</span>
                    </div>
                  </div>
                </button>
              );
            } else {
              const team = item as FPLTeam;
              return (
                <button
                  key={`team-${team.id}`}
                  onClick={() => handleSelect(team)}
                  className="flex items-center w-full px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700/50 last:border-0 transition-colors text-left"
                >
                  <div className="w-8 h-8 mr-3 shrink-0 flex items-center justify-center">
                     <img 
                        src={`https://resources.premierleague.com/premierleague/badges/t${team.code}.png`}
                        alt={team.name}
                        className="w-full h-full object-contain drop-shadow-sm"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                  </div>
                  <div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">{team.name}</div>
                  </div>
                </button>
              );
            }
          })}
        </div>
      )}
      
      {isOpen && query.trim() !== '' && filteredResults.length === 0 && (
        <div className="absolute mt-2 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-4 text-center text-sm text-slate-500 dark:text-slate-400">
          No matches found for "{query}"
        </div>
      )}
    </div>
  );
}

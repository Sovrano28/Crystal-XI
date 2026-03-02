'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useCompareStore } from '@/lib/hooks/useCompareStore';
import { FPLPlayer, FPLTeam } from '@/types/fpl';
import { Bookmark, Save, Trash2, X, Plus } from 'lucide-react';

interface Props {
  players: FPLPlayer[];
  teams: FPLTeam[];
}

export function SavedComparisons({ players, teams }: Props) {
  const { savedComparisons, saveComparison, loadComparison, deleteComparison, mode, selectedPlayers, selectedTeams } = useCompareStore();
  const [isOpen, setIsOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentSelectionCount = mode === 'players' ? selectedPlayers.length : selectedTeams.length;

  const handleSave = () => {
    if (!saveName.trim() || currentSelectionCount === 0) return;
    saveComparison(saveName.trim());
    setSaveName('');
    setIsSaving(false);
    setIsOpen(true);
  };

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsSaving(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative xl:z-[60]" ref={dropdownRef} style={{ zIndex: isOpen ? 60 : 10 }}>
      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl shadow-sm text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
      >
        <Bookmark size={16} className="text-indigo-500" />
        Saved Comparisons
        {savedComparisons.length > 0 && (
          <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full text-xs">
            {savedComparisons.length}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden transform opacity-100 scale-100 transition-all origin-top-right">
          
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bookmark size={16} className="text-indigo-500" /> My Saved Lists
            </h3>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition">
              <X size={18} />
            </button>
          </div>

          <div className="max-h-64 overflow-y-auto p-2 hide-scrollbar">
            {savedComparisons.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm px-4">
                <p className="mb-2">No saved comparisons yet.</p>
                <p className="text-xs text-slate-400">Build your comparison board and save it below to access it later.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {savedComparisons.map(comp => (
                  <div key={comp.id} className="group flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition">
                    <button 
                      onClick={() => {
                        loadComparison(comp.id, players, teams);
                        setIsOpen(false);
                      }}
                      className="flex-1 text-left"
                    >
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate">{comp.name}</p>
                      <p className="text-xs text-slate-400 capitalize">{comp.itemIds.length} {comp.mode}</p>
                    </button>
                    
                    <button 
                      onClick={() => deleteComparison(comp.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition opacity-0 group-hover:opacity-100"
                      title="Delete saved comparison"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Save Current Section */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
            {isSaving ? (
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="e.g. My Premium Mids"
                  className="flex-1 min-w-0 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition dark:text-white"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                />
                <button 
                  onClick={handleSave}
                  disabled={!saveName.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-3 py-2 rounded-xl text-sm font-bold transition flex items-center justify-center shadow-sm"
                >
                  <Save size={16} />
                </button>
                <button 
                  onClick={() => setIsSaving(false)}
                  className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 px-3 py-2 rounded-xl text-sm font-bold transition flex items-center justify-center"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsSaving(true)}
                disabled={currentSelectionCount === 0}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:border-indigo-500 hover:text-indigo-600 dark:hover:border-indigo-400 dark:hover:text-indigo-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={16} />
                Save Current Selection
              </button>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

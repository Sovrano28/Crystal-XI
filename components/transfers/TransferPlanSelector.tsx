'use client';

import { useState } from 'react';
import { TransferPlan } from '@/types/user';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface TransferPlanSelectorProps {
  plans: TransferPlan[];
  activePlan: TransferPlan | null;
  currentGameweek: number;
  isLoading: boolean;
  onCreatePlan: (name: string, gameweek: number) => Promise<void>;
  onSelectPlan: (planId: string) => Promise<void>;
  onDeletePlan: (planId: string) => Promise<void>;
  onDeactivate: () => Promise<void>;
}

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';

export function TransferPlanSelector({
  plans,
  activePlan,
  currentGameweek,
  isLoading,
  onCreatePlan,
  onSelectPlan,
  onDeletePlan,
  onDeactivate,
}: TransferPlanSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!newPlanName.trim()) return;
    await onCreatePlan(newPlanName.trim(), currentGameweek);
    setNewPlanName('');
    setIsCreating(false);
  };

  const handleSelect = async (planId: string) => {
    await onSelectPlan(planId);
    setIsOpen(false);
  };

  const handleDeleteClick = (e: React.MouseEvent, planId: string) => {
    e.stopPropagation();
    setPlanToDelete(planId);
  };

  const confirmDelete = async () => {
    if (planToDelete) {
      await onDeletePlan(planToDelete);
      setPlanToDelete(null);
    }
  };

  const isExpired = activePlan && activePlan.gameweek < currentGameweek;

  return (
    <div className="relative">
      <Dialog open={!!planToDelete} onOpenChange={(open) => !open && setPlanToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Transfer Plan?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the transfer plan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPlanToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Expired Plan Warning */}
      {isExpired && (
        <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2 text-amber-500 text-sm">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>
              <strong>Plan Expired:</strong> This plan was for GW{activePlan.gameweek}. The current gameweek is GW{currentGameweek}.
            </span>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => setPlanToDelete(activePlan._id!)} className="text-amber-500 hover:text-amber-400">
              Clear (Delete)
            </Button>
            <Button size="sm" variant="outline" onClick={() => onDeactivate()} className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10">
              Keep (Deactivate)
            </Button>
          </div>
        </div>
      )}

      {/* Current Plan Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium',
          'transition-all border',
          activePlan
            ? 'bg-[var(--pl-cyan)]/10 border-[var(--pl-cyan)]/30 text-[var(--pl-cyan)]'
            : 'bg-[var(--surface-elevated)] border-[var(--surface-border)] text-[var(--foreground-muted)]'
        )}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <span className="hidden sm:inline">
          {activePlan ? activePlan.name : 'No Plan Active'}
        </span>
        <span className="sm:hidden">
          {activePlan ? 'Plan' : 'Plans'}
        </span>
        <svg className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')} 
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className={cn(
            'absolute top-full left-0 mt-2 z-50',
            'w-72 p-3 rounded-xl shadow-xl',
            'bg-[var(--surface-elevated)] border border-[var(--surface-border)]',
            'animate-fade-in-up'
          )}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--surface-border)]">
              <h3 className="text-sm font-semibold text-[var(--foreground)]">Transfer Plans</h3>
              <button
                onClick={() => setIsCreating(true)}
                className="text-xs text-[var(--pl-cyan)] hover:underline flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Plan
              </button>
            </div>

            {/* Create New Plan Form */}
            {isCreating && (
              <div className="mb-3 p-2 bg-[var(--surface)]/50 rounded-lg">
                <input
                  type="text"
                  placeholder="Plan name..."
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                  className={cn(
                    'w-full px-3 py-2 rounded-md text-sm mb-2',
                    'bg-[var(--surface)] border border-[var(--surface-border)]',
                    'text-[var(--foreground)] placeholder:text-[var(--foreground-muted)]',
                    'focus:outline-none focus:ring-2 focus:ring-[var(--pl-cyan)]/50'
                  )}
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                />
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setIsCreating(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" variant="glow" onClick={handleCreate} disabled={!newPlanName.trim()}>
                    Create
                  </Button>
                </div>
              </div>
            )}

            {/* Plans List */}
            {isLoading ? (
              <div className="py-4 text-center text-[var(--foreground-muted)] text-sm">
                Loading plans...
              </div>
            ) : plans.length === 0 ? (
              <div className="py-4 text-center text-[var(--foreground-muted)] text-sm">
                No plans yet. Create one to start planning transfers!
              </div>
            ) : (
              <div className="space-y-1 max-h-60 overflow-auto">
                {plans.map((plan) => (
                  <div
                    key={plan._id}
                    onClick={() => handleSelect(plan._id!)}
                    className={cn(
                      'flex items-center justify-between gap-2 px-3 py-2 rounded-lg cursor-pointer',
                      'transition-colors group',
                      plan.isActive
                        ? 'bg-[var(--pl-cyan)]/10 border border-[var(--pl-cyan)]/30'
                        : 'hover:bg-[var(--surface)]/80'
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'text-sm font-medium truncate',
                          plan.isActive ? 'text-[var(--pl-cyan)]' : 'text-[var(--foreground)]'
                        )}>
                          {plan.name}
                        </span>
                        {plan.isActive && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase bg-[var(--pl-cyan)]/20 text-[var(--pl-cyan)] rounded">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[var(--foreground-muted)]">
                        {plan.transfers.length} transfer{plan.transfers.length !== 1 ? 's' : ''} • GW{plan.gameweek}
                      </div>
                    </div>
                    
                    {/* Delete Button */}
                    <button
                      onClick={(e) => handleDeleteClick(e, plan._id!)}
                      className={cn(
                        'p-1.5 rounded-md opacity-0 group-hover:opacity-100',
                        'text-red-400 hover:bg-red-500/10',
                        'transition-all'
                      )}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* View Real Squad Option */}
            {activePlan && (
              <div className="mt-3 pt-3 border-t border-[var(--surface-border)]">
                <button
                  onClick={() => { onDeactivate(); setIsOpen(false); }}
                  className="w-full px-3 py-2 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)]/50 rounded-lg transition-colors text-left flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  View Real Squad
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

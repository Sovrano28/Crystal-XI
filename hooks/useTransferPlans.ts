'use client';

import { useState, useEffect, useCallback } from 'react';
import { TransferPlan } from '@/types/user';

interface UseTransferPlansReturn {
  plans: TransferPlan[];
  activePlan: TransferPlan | null;
  isLoading: boolean;
  error: string | null;
  // CRUD operations
  createPlan: (name: string, gameweek: number) => Promise<TransferPlan | null>;
  updatePlan: (planId: string, updates: Partial<TransferPlan>) => Promise<TransferPlan | null>;
  deletePlan: (planId: string) => Promise<boolean>;
  activatePlan: (planId: string) => Promise<boolean>;
  deactivateAll: () => Promise<boolean>;
  // Transfer operations
  addTransfer: (planId: string, transfer: TransferPlan['transfers'][0]) => Promise<boolean>;
  removeTransfer: (planId: string, playerOutId: number) => Promise<boolean>;
  // Refresh
  refreshPlans: () => Promise<void>;
}

export function useTransferPlans(): UseTransferPlansReturn {
  const [plans, setPlans] = useState<TransferPlan[]>([]);
  const [activePlan, setActivePlan] = useState<TransferPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all plans
  const refreshPlans = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [plansRes, activeRes] = await Promise.all([
        fetch('/api/transfer-plans'),
        fetch('/api/transfer-plans/active'),
      ]);

      if (plansRes.ok) {
        const data = await plansRes.json();
        setPlans(data.plans || []);
      }

      if (activeRes.ok) {
        const data = await activeRes.json();
        setActivePlan(data.plan || null);
      }
    } catch (err) {
      console.error('Error fetching transfer plans:', err);
      setError('Failed to load transfer plans');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load & Polling
  useEffect(() => {
    refreshPlans();
    
    // Poll every 30 seconds for cross-device sync
    const interval = setInterval(refreshPlans, 30000);
    return () => clearInterval(interval);
  }, [refreshPlans]);

  // Create new plan
  const createPlan = useCallback(async (name: string, gameweek: number): Promise<TransferPlan | null> => {
    try {
      const res = await fetch('/api/transfer-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, gameweek }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create plan');
      }

      const data = await res.json();
      await refreshPlans();
      return data.plan;
    } catch (err) {
      console.error('Error creating plan:', err);
      setError(err instanceof Error ? err.message : 'Failed to create plan');
      return null;
    }
  }, [refreshPlans]);

  // Update plan
  const updatePlan = useCallback(async (planId: string, updates: Partial<TransferPlan>): Promise<TransferPlan | null> => {
    try {
      const res = await fetch(`/api/transfer-plans/${planId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update plan');
      }

      const data = await res.json();
      await refreshPlans();
      return data.plan;
    } catch (err) {
      console.error('Error updating plan:', err);
      setError(err instanceof Error ? err.message : 'Failed to update plan');
      return null;
    }
  }, [refreshPlans]);

  // Delete plan
  const deletePlan = useCallback(async (planId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/transfer-plans/${planId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete plan');
      }

      await refreshPlans();
      return true;
    } catch (err) {
      console.error('Error deleting plan:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete plan');
      return false;
    }
  }, [refreshPlans]);

  // Activate plan
  const activatePlan = useCallback(async (planId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/transfer-plans/${planId}/activate`, {
        method: 'POST',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to activate plan');
      }

      await refreshPlans();
      return true;
    } catch (err) {
      console.error('Error activating plan:', err);
      setError(err instanceof Error ? err.message : 'Failed to activate plan');
      return false;
    }
  }, [refreshPlans]);

  // Deactivate all plans
  const deactivateAll = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/transfer-plans/active', {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to deactivate plans');
      }

      await refreshPlans();
      return true;
    } catch (err) {
      console.error('Error deactivating plans:', err);
      setError(err instanceof Error ? err.message : 'Failed to deactivate plans');
      return false;
    }
  }, [refreshPlans]);

  // Add transfer to plan
  const addTransfer = useCallback(async (planId: string, transfer: TransferPlan['transfers'][0]): Promise<boolean> => {
    const plan = plans.find(p => p._id === planId);
    if (!plan) return false;

    // Remove any existing transfer for the same outgoing player
    const existingTransfers = plan.transfers.filter(t => t.playerOut !== transfer.playerOut);
    const newTransfers = [...existingTransfers, transfer];

    const result = await updatePlan(planId, { transfers: newTransfers });
    return result !== null;
  }, [plans, updatePlan]);

  // Remove transfer from plan
  const removeTransfer = useCallback(async (planId: string, playerOutId: number): Promise<boolean> => {
    const plan = plans.find(p => p._id === planId);
    if (!plan) return false;

    const newTransfers = plan.transfers.filter(t => t.playerOut !== playerOutId);
    const result = await updatePlan(planId, { transfers: newTransfers });
    return result !== null;
  }, [plans, updatePlan]);

  return {
    plans,
    activePlan,
    isLoading,
    error,
    createPlan,
    updatePlan,
    deletePlan,
    activatePlan,
    deactivateAll,
    addTransfer,
    removeTransfer,
    refreshPlans,
  };
}

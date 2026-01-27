'use client';

import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface TransferPreviewProps {
  currentBank: number;
  transfersCost: number;
  transfersCount: number;
  freeTransfers: number;
  className?: string;
  transfersOutValue: number;
  transfersInCost: number;
}

export function TransferPreview({
  currentBank,
  transfersCost,
  transfersCount,
  freeTransfers,
  className,
  transfersOutValue,
  transfersInCost,
}: TransferPreviewProps) {
  const pointsCost = Math.max(0, (transfersCount - freeTransfers) * 4);
  const remainingBank = currentBank + transfersOutValue - transfersInCost;

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-3 gap-4', className)}>
      <Card padding="sm" className="bg-[var(--surface-elevated)]">
        <p className="text-xs text-[var(--foreground-muted)] uppercase tracking-wider font-medium">Remaining Bank</p>
        <div className={cn("text-2xl font-bold mt-1", remainingBank < 0 ? "text-red-500" : "text-[var(--pl-cyan)]")}>
          £{(remainingBank / 10).toFixed(1)}m
        </div>
      </Card>

      <Card padding="sm" className="bg-[var(--surface-elevated)]">
        <p className="text-xs text-[var(--foreground-muted)] uppercase tracking-wider font-medium">Transfers Made</p>
        <div className="text-2xl font-bold mt-1 text-[var(--foreground)]">
          {transfersCount} <span className="text-sm font-normal text-[var(--foreground-muted)]">/ {freeTransfers} free</span>
        </div>
      </Card>

      <Card padding="sm" className="bg-[var(--surface-elevated)]">
        <p className="text-xs text-[var(--foreground-muted)] uppercase tracking-wider font-medium">Points Cost</p>
        <div className={cn("text-2xl font-bold mt-1", pointsCost > 0 ? "text-red-500" : "text-[var(--foreground)]")}>
          -{pointsCost} pts
        </div>
      </Card>
    </div>
  );
}

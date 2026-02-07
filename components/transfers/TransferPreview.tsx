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
  remainingBank?: number;
  squadValue?: number; // New: sum of selling prices
}

export function TransferPreview({
  currentBank,
  transfersCost,
  transfersCount,
  freeTransfers,
  className,
  transfersOutValue,
  transfersInCost,
  remainingBank: propRemainingBank,
  squadValue,
}: TransferPreviewProps) {
  const pointsCost = Math.max(0, (transfersCount - freeTransfers) * 4);
  const remainingBank = propRemainingBank ?? (currentBank + transfersOutValue - transfersInCost);

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-2', className)}>
      {/* Squad Value */}
      <Card padding="none" className="bg-[var(--surface-elevated)] px-3 py-2">
        <p className="text-[10px] text-[var(--foreground-muted)] uppercase tracking-wider font-medium">Squad Value</p>
        <div className="text-lg font-bold text-[var(--pl-magenta)]">
          £{squadValue ? (squadValue / 10).toFixed(1) : '—'}m
        </div>
      </Card>

      {/* Remaining Bank */}
      <Card padding="none" className="bg-[var(--surface-elevated)] px-3 py-2">
        <p className="text-[10px] text-[var(--foreground-muted)] uppercase tracking-wider font-medium">Bank</p>
        <div className={cn("text-lg font-bold", remainingBank < 0 ? "text-red-500" : "text-[var(--pl-cyan)]")}>
          £{(remainingBank / 10).toFixed(1)}m
        </div>
      </Card>

      {/* Transfers Made */}
      <Card padding="none" className="bg-[var(--surface-elevated)] px-3 py-2">
        <p className="text-[10px] text-[var(--foreground-muted)] uppercase tracking-wider font-medium">Transfers</p>
        <div className="text-lg font-bold text-[var(--foreground)]">
          {transfersCount} <span className="text-xs font-normal text-[var(--foreground-muted)]">/ {freeTransfers} free</span>
        </div>
      </Card>

      {/* Points Cost */}
      <Card padding="none" className="bg-[var(--surface-elevated)] px-3 py-2">
        <p className="text-[10px] text-[var(--foreground-muted)] uppercase tracking-wider font-medium">Points Cost</p>
        <div className={cn("text-lg font-bold", pointsCost > 0 ? "text-red-500" : "text-[var(--foreground)]")}>
          -{pointsCost} pts
        </div>
      </Card>
    </div>
  );
}

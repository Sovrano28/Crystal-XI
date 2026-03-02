import React from 'react';
import { FPLPlayer } from '@/types/fpl';
import { getPlayerInjuryStatus } from '@/lib/utils/injury-flags';
import { AlertTriangle, PlusSquare } from 'lucide-react';

interface Props {
  player: FPLPlayer | undefined;
  size?: 'sm' | 'md' | 'lg';
  showBackground?: boolean;
}

export function PlayerInjuryIcon({ player, size = 'sm', showBackground = false }: Props) {
  const { color, message, isAvailable } = getPlayerInjuryStatus(player);

  if (isAvailable || color === 'none') return null;

  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 20
  };

  const bgClasses = showBackground ? {
    red: 'bg-rose-100 dark:bg-rose-900/40 border border-rose-200 dark:border-rose-800/60',
    orange: 'bg-orange-100 dark:bg-orange-900/40 border border-orange-200 dark:border-orange-800/60',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/40 border border-yellow-200 dark:border-yellow-800/60',
    none: ''
  } : { red: '', orange: '', yellow: '', none: '' };

  const iconColors = {
    red: 'text-rose-600 dark:text-rose-500',
    orange: 'text-orange-500 dark:text-orange-400',
    yellow: 'text-yellow-500 dark:text-yellow-400',
    none: ''
  };

  const IconComponent = color === 'red' ? PlusSquare : AlertTriangle; // Red flag uses medical cross, doubt uses warning triangle

  return (
    <div 
      className={`inline-flex items-center justify-center rounded-md ${bgClasses[color]} ${showBackground ? 'p-1' : ''}`}
      title={message}
    >
      <IconComponent size={iconSizes[size]} className={`${iconColors[color]} drop-shadow-sm`} />
    </div>
  );
}

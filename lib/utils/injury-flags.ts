import { FPLPlayer } from '@/types/fpl';

export type InjuryFlagColor = 'red' | 'orange' | 'yellow' | 'none';

export interface InjuryStatus {
  color: InjuryFlagColor;
  message: string;
  shortMessage: string;
  isAvailable: boolean;
}

/**
 * Evaluates an FPL player's status and chance of playing to return a standardized injury flag.
 */
export function getPlayerInjuryStatus(player: FPLPlayer | undefined): InjuryStatus {
  if (!player) return { color: 'none', message: 'Available', shortMessage: 'Available', isAvailable: true };

  // 1. Red Flags (Guaranteed out)
  if (['i', 's', 'u', 'n'].includes(player.status) || player.chance_of_playing_next_round === 0) {
    let msg = player.news || 'Unavailable';
    let shortMsg = 'Out';
    
    if (player.status === 's') {
      msg = 'Suspended: ' + msg;
      shortMsg = 'Suspended';
    } else if (player.status === 'u' || player.status === 'n') {
      shortMsg = 'Unavailable';
    }
    
    return {
      color: 'red',
      message: msg,
      shortMessage: shortMsg,
      isAvailable: false
    };
  }

  // 2. Yellow/Orange Flags (Doubtful)
  if (player.status === 'd' || (player.chance_of_playing_next_round !== undefined && player.chance_of_playing_next_round < 100)) {
    const chance = player.chance_of_playing_next_round;
    
    // Default to orange for doubtful without explicit %
    let color: InjuryFlagColor = 'orange'; 
    let msg = player.news || 'Doubtful';
    let shortMsg = 'Doubtful';

    if (chance !== undefined) {
      msg = `${chance}% chance of playing: ${player.news}`;
      shortMsg = `${chance}%`; // Just show the percentage for the short label
      // FPL tends to treat 75% as yellow, 25/50% as orange
      if (chance >= 75) {
        color = 'yellow';
      } else {
        color = 'orange';
      }
    }

    return {
      color,
      message: msg,
      shortMessage: shortMsg,
      isAvailable: false
    };
  }

  // 3. Available (No Flag)
  return {
    color: 'none',
    message: 'Available',
    shortMessage: 'Available',
    isAvailable: true
  };
}

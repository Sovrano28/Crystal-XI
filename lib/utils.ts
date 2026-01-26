import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  // FPL prices are in tenths, so divide by 10
  return `£${(price / 10).toFixed(1)}m`;
}

export function getDifficultyColor(difficulty: number): string {
  switch (difficulty) {
    case 1:
      return 'bg-green-500';
    case 2:
      return 'bg-green-400';
    case 3:
      return 'bg-yellow-400';
    case 4:
      return 'bg-orange-500';
    case 5:
      return 'bg-red-500';
    default:
      return 'bg-gray-400';
  }
}

export function getDifficultyText(difficulty: number): string {
  switch (difficulty) {
    case 1:
      return 'Very Easy';
    case 2:
      return 'Easy';
    case 3:
      return 'Medium';
    case 4:
      return 'Hard';
    case 5:
      return 'Very Hard';
    default:
      return 'Unknown';
  }
}

export function getPositionName(position: number): string {
  switch (position) {
    case 1:
      return 'Goalkeeper';
    case 2:
      return 'Defender';
    case 3:
      return 'Midfielder';
    case 4:
      return 'Forward';
    default:
      return 'Unknown';
  }
}

export function getPositionShortName(position: number): string {
  switch (position) {
    case 1:
      return 'GK';
    case 2:
      return 'DEF';
    case 3:
      return 'MID';
    case 4:
      return 'FWD';
    default:
      return '?';
  }
}


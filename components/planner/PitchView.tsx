'use client';

import { cn } from '@/lib/utils';
import { FDRBadge, GameweekBadge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { PlayerWithFixtures, FPLTeam } from '@/types/fpl';
import { PlayerKit } from '@/components/planner/PlayerKit';
import { getDifficultyColor } from '@/lib/utils';

interface PitchViewProps {
  players: PlayerWithFixtures[];
  teams: FPLTeam[];
  selectedGameweek: number;
  onPlayerClick?: (player: PlayerWithFixtures) => void;
  // Captaincy Props
  captainId?: number;
  viceCaptainId?: number;
  onCaptainChange?: (playerId: number, isCaptain: boolean) => void; // true=Captain, false=Vice
  // Substitution Props
  substitutionMode?: number | null; // ID of selected player for sub
  onSubstitute?: (playerId: number) => void;
  enableCaptaincyOptions?: boolean;
  showAllPlayers?: boolean;
  onRemove?: (playerId: number) => void;
  // Navigation Props
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  showNavigation?: boolean;
  canGoPrev?: boolean;
  canGoNext?: boolean;
}

// Standard 4-4-2 formation positions
const positions = {
  1: { row: 0, label: 'GK' }, // Goalkeeper
  2: { row: 1, label: 'DEF' }, // Defenders
  3: { row: 2, label: 'MID' }, // Midfielders
  4: { row: 3, label: 'FWD' }, // Forwards
};

export function PitchView({ 
  players, 
  teams, 
  selectedGameweek, 
  onPlayerClick,
  captainId,
  viceCaptainId,
  substitutionMode,
  onSubstitute,
  enableCaptaincyOptions = true,
  showAllPlayers = false,
  onRemove,
  onCaptainChange,
  onPrevWeek,
  onNextWeek,
  showNavigation = false,
  canGoPrev = false,
  canGoNext = false,
}: PitchViewProps) {
  // Filter for empty slots (placeholders have id < 0)
  const isEmptySlot = (p: PlayerWithFixtures) => p.id < 0;

  // Sort players by position
  const goalkeepers = players.filter((p) => p.element_type === 1);
  const defenders = players.filter((p) => p.element_type === 2);
  const midfielders = players.filter((p) => p.element_type === 3);
  const forwards = players.filter((p) => p.element_type === 4);

  // Determine display groups based on mode
  let starters = players.slice(0, 11);
  let subs = players.slice(11);

  if (showAllPlayers) {
    starters = players; // Show everyone on pitch
    subs = [];
  }

  // Group by position (using the determined 'starters' set)
  const startersByPosition = {
    gk: starters.filter((p) => p.element_type === 1),
    def: starters.filter((p) => p.element_type === 2),
    mid: starters.filter((p) => p.element_type === 3),
    fwd: starters.filter((p) => p.element_type === 4),
  };

  const getTeamShortName = (teamId: number) => {
    return teams.find((t) => t.id === teamId)?.short_name || 'UNK';
  };

  return (
    <div className="relative flex flex-col lg:flex-row lg:items-stretch gap-4 lg:gap-6">
      {/* PITCH SECTION - Takes ~65% on desktop, matches sidebar height */}
      <div className="flex-1 lg:max-w-[65%] flex">
        {/* Pitch Container */}
        <div
          className={cn(
            'relative rounded-2xl overflow-hidden flex-1',
            'bg-gradient-to-b from-green-600 via-green-500 to-green-600',
            'p-3 md:p-4',
            'shadow-inner border-2 border-green-700',
            'flex flex-col justify-between'
          )}
        >
          {/* Pitch Lines */}
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            {/* Center line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/80" />
            {/* Center circle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-white/80 rounded-full" />
            {/* Penalty areas */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-16 border-2 border-white/80 border-t-0" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-36 h-16 border-2 border-white/80 border-b-0" />
            {/* Grass texture */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.05)_50%,transparent_50%)] bg-[length:100%_30px]" />
          </div>

          {/* Players Grid - evenly distributed across pitch */}
          <div className="relative z-10 flex flex-col justify-between flex-1 py-1">
            {/* Forwards - at the top */}
            <div className="flex justify-center gap-4 md:gap-8">
              {startersByPosition.fwd.map((player) => (
                <PlayerPitchCard
                  key={player.id}
                  player={player}
                  teamShortName={getTeamShortName(player.team)}
                  gameweek={selectedGameweek}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSubstitute?.(player.id);
                  }}
                  isSub={false}
                  isCaptain={player.id === captainId}
                  isViceCaptain={player.id === viceCaptainId}
                  isSelected={substitutionMode === player.id}
                  onCaptainSelect={() => onCaptainChange?.(player.id, true)}
                  onViceCaptainSelect={() => onCaptainChange?.(player.id, false)}
                />
              ))}
            </div>

            {/* Midfielders */}
            <div className="flex justify-center gap-3 md:gap-6">
              {startersByPosition.mid.map((player) => (
                <PlayerPitchCard
                  key={player.id}
                  player={player}
                  teamShortName={getTeamShortName(player.team)}
                  gameweek={selectedGameweek}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSubstitute?.(player.id);
                  }}
                  isSub={false}
                  isCaptain={player.id === captainId}
                  isViceCaptain={player.id === viceCaptainId}
                  isSelected={substitutionMode === player.id}
                  onCaptainSelect={() => onCaptainChange?.(player.id, true)}
                  onViceCaptainSelect={() => onCaptainChange?.(player.id, false)}
                />
              ))}
            </div>

            {/* Defenders */}
            <div className="flex justify-center gap-3 md:gap-6">
              {startersByPosition.def.map((player) => (
                <PlayerPitchCard
                  key={player.id}
                  player={player}
                  teamShortName={getTeamShortName(player.team)}
                  gameweek={selectedGameweek}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSubstitute?.(player.id);
                  }}
                  isSub={false}
                  isCaptain={player.id === captainId}
                  isViceCaptain={player.id === viceCaptainId}
                  isSelected={substitutionMode === player.id}
                  onCaptainSelect={() => onCaptainChange?.(player.id, true)}
                  onViceCaptainSelect={() => onCaptainChange?.(player.id, false)}
                />
              ))}
            </div>

            {/* Goalkeeper - at the bottom near goal */}
            <div className="flex justify-center">
              {startersByPosition.gk.map((player) => (
                <PlayerPitchCard
                  key={player.id}
                  player={player}
                  teamShortName={getTeamShortName(player.team)}
                  gameweek={selectedGameweek}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSubstitute?.(player.id);
                  }}
                  isSub={false}
                  isCaptain={player.id === captainId}
                  isViceCaptain={player.id === viceCaptainId}
                  isSelected={substitutionMode === player.id}
                  onCaptainSelect={() => onCaptainChange?.(player.id, true)}
                  onViceCaptainSelect={() => onCaptainChange?.(player.id, false)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR - Navigation + Substitutes */}
      <div className="lg:w-[180px] flex flex-col gap-4">
        {/* Navigation Buttons - Always show, horizontal */}
        <div className="flex items-center justify-center gap-3 bg-[var(--surface)] rounded-xl p-3 border border-[var(--surface-border)]">
          <button
            onClick={onPrevWeek}
            disabled={!canGoPrev}
            className={cn(
              'p-2.5 rounded-lg',
              'bg-[var(--surface-hover)] border border-[var(--surface-border)]',
              'hover:bg-[var(--primary)] hover:text-white transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            title="Previous Gameweek"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm font-medium text-[var(--foreground-muted)]">
            GW{selectedGameweek}
          </span>
          <button
            onClick={onNextWeek}
            disabled={!canGoNext}
            className={cn(
              'p-2.5 rounded-lg',
              'bg-[var(--surface-hover)] border border-[var(--surface-border)]',
              'hover:bg-[var(--primary)] hover:text-white transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            title="Next Gameweek"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Substitutes - Vertical on desktop, Horizontal on mobile */}
        {subs.length > 0 && (
          <div className="bg-[var(--surface)] rounded-xl p-3 border border-[var(--surface-border)]">
            <h4 className="text-xs font-semibold text-[var(--foreground-muted)] mb-3 uppercase tracking-wide text-center">
              Substitutes
            </h4>
            {/* Desktop: Vertical stack, centered */}
            <div className="hidden lg:flex flex-col items-center gap-3">
              {subs.map((player) => (
                <PlayerPitchCard
                  key={player.id}
                  player={player}
                  teamShortName={getTeamShortName(player.team)}
                  gameweek={selectedGameweek}
                  onClick={() => onSubstitute?.(player.id)}
                  isSub
                  isCaptain={player.id === captainId}
                  isViceCaptain={player.id === viceCaptainId}
                  isSelected={substitutionMode === player.id}
                  onCaptainSelect={() => onCaptainChange?.(player.id, true)}
                  onViceCaptainSelect={() => onCaptainChange?.(player.id, false)}
                />
              ))}
            </div>
            {/* Mobile: Horizontal scroll, centered */}
            <div className="flex lg:hidden justify-center gap-3 overflow-x-auto pb-2 hide-scrollbar">
              {subs.map((player) => (
                <PlayerPitchCard
                  key={player.id}
                  player={player}
                  teamShortName={getTeamShortName(player.team)}
                  gameweek={selectedGameweek}
                  onClick={() => onSubstitute?.(player.id)}
                  isSub
                  isCaptain={player.id === captainId}
                  isViceCaptain={player.id === viceCaptainId}
                  isSelected={substitutionMode === player.id}
                  onCaptainSelect={() => onCaptainChange?.(player.id, true)}
                  onViceCaptainSelect={() => onCaptainChange?.(player.id, false)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface PlayerPitchCardProps {
  player: PlayerWithFixtures;
  teamShortName: string;
  gameweek: number;
  onClick?: (e: React.MouseEvent) => void;
  isSub?: boolean;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  isSelected?: boolean;
  onCaptainSelect?: () => void;
  onViceCaptainSelect?: () => void;
  enableCaptaincyOptions?: boolean;
  onRemove?: (playerId: number) => void;
}

import { CaptainBadge } from '@/components/planner/CaptainBadge';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

function PlayerPitchCard({ 
  player, 
  teamShortName, 
  gameweek, 
  onClick, 
  isSub,
  isCaptain,
  isViceCaptain,
  isSelected,
  onCaptainSelect,
  onViceCaptainSelect,
  enableCaptaincyOptions = true,
  onRemove,
}: PlayerPitchCardProps) {
  const isEmptySlot = player.id < 0;
  
  if (isEmptySlot) {
     return (
        <button 
          onClick={onClick}
          className={cn(
             "relative flex flex-col items-center justify-center",
             "w-16 h-20 md:w-20 md:h-24",
             "border-2 border-dashed border-white/40 hover:border-white/80",
             "rounded-xl transition-all bg-black/10 hover:bg-black/20",
             isSelected && "ring-2 ring-[var(--pl-cyan)] border-[var(--pl-cyan)] bg-[var(--pl-cyan)]/10"
          )}
        >
           <span className="text-white/60 font-bold text-sm">
             {/* Map element type to text */}
             {player.element_type === 1 ? 'GK' : 
              player.element_type === 2 ? 'DEF' : 
              player.element_type === 3 ? 'MID' : 'FWD'}
           </span>
           <div className="mt-1 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
             <span className="text-white text-lg leading-none mb-0.5">+</span>
           </div>
        </button>
     );
  }

  const fixture = player.upcomingFixtures?.find((f) => f.gameweek === gameweek);
  const hasDoubleGameweek = player.upcomingFixtures?.filter((f) => f.gameweek === gameweek).length > 1;
  const hasBlankGameweek = !fixture;

  // Determine badge content
  let badgeContent = '-';
  let badgeColorClass = 'bg-gray-500';

  if (hasBlankGameweek) {
    badgeContent = 'BLANK';
    badgeColorClass = 'bg-gray-500';
  } else if (hasDoubleGameweek) {
    badgeContent = 'DGW';
    badgeColorClass = 'bg-[var(--pl-magenta)]';
  } else if (fixture) {
    badgeContent = `${fixture.opponent.short_name} (${fixture.isHome ? 'H' : 'A'})`;
    badgeColorClass = getDifficultyColor(fixture.difficulty);
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Tooltip
          content={
            <div className="text-center">
              <p className="font-medium">{player.web_name}</p>
              {fixture && (
                <p className="text-xs mt-1">
                  vs {fixture.opponent.name}
                </p>
              )}
              {/* Mobile Tip */}
              {enableCaptaincyOptions && (
                <p className="text-[10px] text-[var(--foreground-muted)] mt-1 opacity-70">
                  Right-click for options
                </p>
              )}
            </div>
          }
        >
          <button
            onClick={onClick}
            className={cn(
              'relative flex flex-col items-center',
              'transition-all duration-200',
              'hover:scale-105',
              isSub && 'opacity-80',
              isSelected && 'ring-2 ring-[var(--pl-cyan)] ring-offset-2 ring-offset-transparent rounded-xl scale-110 z-30'
            )}
          >
            {/* Kit & Name Container */}
            <div className="relative mb-8">
              {/* Captain Badges */}
              {isCaptain && (
                <div className="absolute -top-2 -right-2 z-20 animate-pulse-slow">
                  <CaptainBadge type="C" size="sm" />
                </div>
              )}
              {isViceCaptain && (
                <div className="absolute -top-2 -right-2 z-20">
                  <CaptainBadge type="V" size="sm" />
                </div>
              )}

              {/* Jersey */}
              <PlayerKit teamShortName={teamShortName} size="lg" className="drop-shadow-xl" />
              
              {/* Name Overlay */}
              <div 
                className={cn(
                  'absolute -bottom-2 left-1/2 -translate-x-1/2',
                  'w-[120%] h-8',
                  'flex items-center justify-center',
                  'bg-gradient-to-t from-black/90 to-black/60',
                  'backdrop-blur-[2px]',
                  'rounded-md',
                  'border-t border-white/10 shadow-lg',
                  'z-10'
                )}
              >
                <span className="text-white text-[10px] sm:text-xs font-bold truncate px-1 uppercase tracking-wide">
                  {player.web_name}
                </span>
              </div>
            </div>

            {/* Fixture/Difficulty Badge */}
            <div
              className={cn(
                'absolute -bottom-1',
                'px-2 py-0.5 rounded-full',
                badgeColorClass,
                'text-[10px] font-bold text-white',
                'shadow-md border border-white/20',
                'whitespace-nowrap',
                'z-20'
              )}
            >
              {badgeContent}
            </div>
          </button>
        </Tooltip>
      </ContextMenuTrigger>
      
      {/* Remove Button for Transfers */}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(player.id);
          }}
          className="absolute -top-2 -left-2 z-40 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
          title="Remove player"
        >
          <span className="text-xs font-bold leading-none mb-0.5">×</span>
        </button>
      )}

      {enableCaptaincyOptions && (
        <ContextMenuContent>
          <ContextMenuItem onClick={onCaptainSelect}>
            Make Captain
          </ContextMenuItem>
          <ContextMenuItem onClick={onViceCaptainSelect}>
            Make Vice-Captain
          </ContextMenuItem>
        </ContextMenuContent>
      )}
    </ContextMenu>
  );
}

'use client';

import { cn } from '@/lib/utils';
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
  // Price display props
  playerPrices?: Map<number, number>; // playerId -> selling price in tenths
  floatingNav?: boolean; // If true, nav buttons float on pitch edges
  onEmptySlotClick?: (position: number) => void;
}

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
  playerPrices,
  floatingNav = false,
  onEmptySlotClick,
}: PitchViewProps) {
  // Filter for empty slots (placeholders have id < 0)


  // Sort players by position


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
      {/* PITCH SECTION - Full width when floatingNav, otherwise ~65% */}
      <div className={cn('flex-1 flex', !floatingNav && 'lg:max-w-[65%]')}>
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

          {/* Floating Navigation Buttons on Pitch Edges */}
          {floatingNav && (
            <>
              {/* Previous GW Button - Left Edge */}
              <button
                onClick={onPrevWeek}
                disabled={!canGoPrev}
                className={cn(
                  'absolute left-2 top-1/2 -translate-y-1/2 z-30',
                  'p-2 rounded-full',
                  'bg-black/50 backdrop-blur-sm border border-white/20',
                  'text-white hover:bg-black/70 transition-all',
                  'disabled:opacity-30 disabled:cursor-not-allowed',
                  'shadow-lg'
                )}
                title="Previous Gameweek"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* GW Label - Top Center */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm border border-white/20">
                <span className="text-white text-xs font-semibold">GW{selectedGameweek}</span>
              </div>

              {/* Next GW Button - Right Edge */}
              <button
                onClick={onNextWeek}
                disabled={!canGoNext}
                className={cn(
                  'absolute right-2 top-1/2 -translate-y-1/2 z-30',
                  'p-2 rounded-full',
                  'bg-black/50 backdrop-blur-sm border border-white/20',
                  'text-white hover:bg-black/70 transition-all',
                  'disabled:opacity-30 disabled:cursor-not-allowed',
                  'shadow-lg'
                )}
                title="Next Gameweek"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

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
                  sellingPrice={playerPrices?.get(player.id)}
                  onRemove={onRemove}
                  enableCaptaincyOptions={enableCaptaincyOptions}
                  onEmptySlotClick={onEmptySlotClick}
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
                  sellingPrice={playerPrices?.get(player.id)}
                  onRemove={onRemove}
                  enableCaptaincyOptions={enableCaptaincyOptions}
                  onEmptySlotClick={onEmptySlotClick}
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
                  sellingPrice={playerPrices?.get(player.id)}
                  onRemove={onRemove}
                  enableCaptaincyOptions={enableCaptaincyOptions}
                  onEmptySlotClick={onEmptySlotClick}
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
                  sellingPrice={playerPrices?.get(player.id)}
                  onRemove={onRemove}
                  enableCaptaincyOptions={enableCaptaincyOptions}
                  onEmptySlotClick={onEmptySlotClick}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR - Navigation + Substitutes (hidden when floatingNav) */}
      {!floatingNav && (
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
                  sellingPrice={playerPrices?.get(player.id)}
                  onRemove={onRemove}
                  enableCaptaincyOptions={enableCaptaincyOptions}
                  onEmptySlotClick={onEmptySlotClick}
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
                  sellingPrice={playerPrices?.get(player.id)}
                  onRemove={onRemove}
                  enableCaptaincyOptions={enableCaptaincyOptions}
                  onEmptySlotClick={onEmptySlotClick}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      )}
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
  sellingPrice?: number; // Selling price in tenths (e.g., 100 = £10.0m)
  onEmptySlotClick?: (position: number) => void;
}

import { CaptainBadge } from '@/components/planner/CaptainBadge';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
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
  sellingPrice,
  onEmptySlotClick,
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

  const fixtures = player.upcomingFixtures?.filter((f) => f.gameweek === gameweek) || [];
  const hasBlankGameweek = fixtures.length === 0;

  return (
    <div className="relative group">
      <ContextMenu>
        <ContextMenuTrigger>
          <Tooltip
            content={
              <div className="text-center">
                <p className="font-medium">{player.web_name}</p>
                {fixtures.map((f, i) => (
                  <p key={i} className="text-xs mt-1">
                    vs {f.opponent.name} ({f.isHome ? 'H' : 'A'})
                  </p>
                ))}
                {hasBlankGameweek && <p className="text-xs mt-1">No Fixture</p>}
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
                
                {/* Name + Price Overlay */}
                <div 
                  className={cn(
                    'absolute -bottom-2 left-1/2 -translate-x-1/2',
                    'w-[120%]',
                    sellingPrice ? 'h-10' : 'h-8',
                    'flex flex-col items-center justify-center',
                    'bg-gradient-to-t from-black/90 to-black/60',
                    'backdrop-blur-[2px]',
                    'rounded-md',
                    'border-t border-white/10 shadow-lg',
                    'z-10'
                  )}
                >
                  <span className="text-white text-[10px] sm:text-xs font-bold truncate px-1 uppercase tracking-wide leading-tight">
                    {player.web_name}
                  </span>
                  {sellingPrice !== undefined && (
                    <span className="text-[var(--pl-cyan)] text-[9px] font-semibold leading-tight">
                      £{(sellingPrice / 10).toFixed(1)}m
                    </span>
                  )}
                </div>
              </div>

              {/* Fixture/Difficulty Badges Container */}
              <div
                className={cn(
                  'absolute flex flex-col items-center gap-0.5 pointer-events-none',
                  sellingPrice ? '-bottom-2' : '-bottom-1',
                  'z-20'
                )}
                style={{ transform: fixtures.length > 1 ? 'translateY(15%)' : 'none' }} 
              >
                 {hasBlankGameweek ? (
                    <div className="px-1.5 py-0.5 rounded-full bg-gray-500 text-[9px] font-bold text-white shadow-md border border-white/20 whitespace-nowrap">
                        BGW
                    </div>
                 ) : (
                    fixtures.map((fixture, idx) => (
                        <div
                            key={idx}
                            className={cn(
                            'px-1.5 py-0.5 rounded-full',
                            getDifficultyColor(fixture.difficulty),
                            'text-[9px] font-bold text-white',
                            'shadow-md border border-white/20',
                            'whitespace-nowrap'
                            )}
                        >
                            {fixture.opponent.short_name} ({fixture.isHome ? 'H' : 'A'})
                        </div>
                    ))
                 )}
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
            className="absolute -top-2 -left-2 z-40 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100"
            title="Remove player"
          >
            <span className="text-xs font-bold leading-none mb-0.5">×</span>
          </button>
        )}

        <ContextMenuContent>
          {enableCaptaincyOptions && (
            <>
              <ContextMenuItem onClick={onCaptainSelect}>
                Make Captain
              </ContextMenuItem>
              <ContextMenuItem onClick={onViceCaptainSelect}>
                Make Vice-Captain
              </ContextMenuItem>
            </>
          )}
          {onRemove && (
            <>
              {enableCaptaincyOptions && <ContextMenuSeparator />}
              <ContextMenuItem onClick={() => onRemove(player.id)} className="text-red-500 focus:text-red-500 focus:bg-red-500/10">
                Remove Player
              </ContextMenuItem>
            </>
          )}
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
}

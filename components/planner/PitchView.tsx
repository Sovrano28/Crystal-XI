'use client';

import { cn } from '@/lib/utils';
import { FDRBadge, GameweekBadge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { PlayerWithFixtures } from '@/types/fpl';

interface PitchViewProps {
  players: PlayerWithFixtures[];
  selectedGameweek: number;
  onPlayerClick?: (player: PlayerWithFixtures) => void;
}

// Standard 4-4-2 formation positions
const positions = {
  1: { row: 0, label: 'GK' }, // Goalkeeper
  2: { row: 1, label: 'DEF' }, // Defenders
  3: { row: 2, label: 'MID' }, // Midfielders
  4: { row: 3, label: 'FWD' }, // Forwards
};

export function PitchView({ players, selectedGameweek, onPlayerClick }: PitchViewProps) {
  // Sort players by position
  const goalkeepers = players.filter((p) => p.element_type === 1);
  const defenders = players.filter((p) => p.element_type === 2);
  const midfielders = players.filter((p) => p.element_type === 3);
  const forwards = players.filter((p) => p.element_type === 4);

  // Starting 11 (first 11 excluding subs)
  const starters = players.slice(0, 11);
  const subs = players.slice(11);

  // Group starters by position
  const startersByPosition = {
    gk: starters.filter((p) => p.element_type === 1),
    def: starters.filter((p) => p.element_type === 2),
    mid: starters.filter((p) => p.element_type === 3),
    fwd: starters.filter((p) => p.element_type === 4),
  };

  return (
    <div className="relative">
      {/* Pitch Container */}
      <div
        className={cn(
          'relative rounded-2xl overflow-hidden',
          'bg-gradient-to-b from-green-600 via-green-500 to-green-600',
          'p-4 md:p-8'
        )}
      >
        {/* Pitch Lines */}
        <div className="absolute inset-0 opacity-30">
          {/* Center line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white" />
          {/* Center circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white rounded-full" />
          {/* Penalty areas */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 border-2 border-white border-t-0" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-20 border-2 border-white border-b-0" />
        </div>

        {/* Players Grid */}
        <div className="relative z-10 space-y-4 md:space-y-6">
          {/* Forwards */}
          <div className="flex justify-center gap-4 md:gap-8">
            {startersByPosition.fwd.map((player) => (
              <PlayerPitchCard
                key={player.id}
                player={player}
                gameweek={selectedGameweek}
                onClick={() => onPlayerClick?.(player)}
              />
            ))}
          </div>

          {/* Midfielders */}
          <div className="flex justify-center gap-3 md:gap-6">
            {startersByPosition.mid.map((player) => (
              <PlayerPitchCard
                key={player.id}
                player={player}
                gameweek={selectedGameweek}
                onClick={() => onPlayerClick?.(player)}
              />
            ))}
          </div>

          {/* Defenders */}
          <div className="flex justify-center gap-3 md:gap-6">
            {startersByPosition.def.map((player) => (
              <PlayerPitchCard
                key={player.id}
                player={player}
                gameweek={selectedGameweek}
                onClick={() => onPlayerClick?.(player)}
              />
            ))}
          </div>

          {/* Goalkeeper */}
          <div className="flex justify-center">
            {startersByPosition.gk.map((player) => (
              <PlayerPitchCard
                key={player.id}
                player={player}
                gameweek={selectedGameweek}
                onClick={() => onPlayerClick?.(player)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Substitutes Bench */}
      {subs.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-[var(--foreground-muted)] mb-3">Substitutes</h4>
          <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
            {subs.map((player) => (
              <PlayerPitchCard
                key={player.id}
                player={player}
                gameweek={selectedGameweek}
                onClick={() => onPlayerClick?.(player)}
                isSub
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface PlayerPitchCardProps {
  player: PlayerWithFixtures;
  gameweek: number;
  onClick?: () => void;
  isSub?: boolean;
}

function PlayerPitchCard({ player, gameweek, onClick, isSub }: PlayerPitchCardProps) {
  const fixture = player.upcomingFixtures?.find((f) => f.gameweek === gameweek);
  const hasDoubleGameweek = player.upcomingFixtures?.filter((f) => f.gameweek === gameweek).length > 1;
  const hasBlankGameweek = !fixture;

  return (
    <Tooltip
      content={
        <div className="text-center">
          <p className="font-medium">{player.web_name}</p>
          {fixture && (
            <p className="text-xs mt-1">
              {fixture.isHome ? 'vs' : '@'} {fixture.opponent.short_name}
            </p>
          )}
        </div>
      }
    >
      <button
        onClick={onClick}
        className={cn(
          'relative flex flex-col items-center',
          'transition-transform duration-200',
          'hover:scale-105',
          isSub && 'opacity-80'
        )}
      >
        {/* Jersey */}
        <div
          className={cn(
            'w-12 h-12 md:w-14 md:h-14 rounded-xl',
            'bg-[var(--surface)] backdrop-blur-sm',
            'border-2 border-white/20',
            'flex items-center justify-center',
            'shadow-lg',
            'transition-all duration-200',
            'hover:shadow-xl hover:border-white/40'
          )}
        >
          {/* FDR Badge or Blank indicator */}
          {hasBlankGameweek ? (
            <GameweekBadge type="bgw" size="sm" />
          ) : hasDoubleGameweek ? (
            <GameweekBadge type="dgw" size="sm" />
          ) : fixture ? (
            <FDRBadge difficulty={fixture.difficulty} size="sm" />
          ) : (
            <span className="text-[var(--foreground-muted)]">-</span>
          )}
        </div>

        {/* Player Name */}
        <div
          className={cn(
            'mt-1 px-2 py-0.5 rounded-md',
            'bg-[var(--pl-purple-dark)]/90 backdrop-blur-sm',
            'text-white text-xs font-medium',
            'max-w-[80px] truncate',
            'shadow-md'
          )}
        >
          {player.web_name}
        </div>

        {/* Captain/Vice Badge */}
        {/* This would need captain data from the API */}
      </button>
    </Tooltip>
  );
}

'use client';

import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/Tooltip';
import { PlayerWithPoints, FPLTeam } from '@/types/fpl';
import { PlayerKit } from '@/components/planner/PlayerKit';
import { CaptainBadge } from '@/components/planner/CaptainBadge';

interface PointsPitchViewProps {
  players: PlayerWithPoints[];
  teams: FPLTeam[];
  gameweek: number;
  onPlayerClick?: (player: PlayerWithPoints) => void;
}

export function PointsPitchView({ players, teams, gameweek, onPlayerClick }: PointsPitchViewProps) {
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

  const getTeamShortName = (teamId: number) => {
    return teams.find((t) => t.id === teamId)?.short_name || 'UNK';
  };

  return (
    <div className="relative">
      {/* Pitch Container */}
      <div
        className={cn(
          'relative rounded-2xl overflow-hidden',
          'bg-gradient-to-b from-green-600 via-green-500 to-green-600',
          'p-4 md:p-8',
          'shadow-inner border-2 border-green-700'
        )}
      >
        {/* Pitch Lines */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          {/* Center line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/80" />
          {/* Center circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white/80 rounded-full" />
          {/* Penalty areas */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 border-2 border-white/80 border-t-0" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-20 border-2 border-white/80 border-b-0" />
          {/* Grass texture/stripes effect overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.05)_50%,transparent_50%)] bg-[length:100%_40px]" />
        </div>

        {/* Players Grid */}
        <div className="relative z-10 space-y-8 md:space-y-10 py-4">
          {/* Forwards */}
          <div className="flex justify-center gap-8 md:gap-12">
            {startersByPosition.fwd.map((player) => (
              <PlayerPointsCard
                key={player.id}
                player={player}
                teamShortName={getTeamShortName(player.team)}
                gameweek={gameweek}
                onClick={() => onPlayerClick?.(player)}
              />
            ))}
          </div>

          {/* Midfielders */}
          <div className="flex justify-center gap-6 md:gap-10">
            {startersByPosition.mid.map((player) => (
              <PlayerPointsCard
                key={player.id}
                player={player}
                teamShortName={getTeamShortName(player.team)}
                gameweek={gameweek}
                onClick={() => onPlayerClick?.(player)}
              />
            ))}
          </div>

          {/* Defenders */}
          <div className="flex justify-center gap-6 md:gap-10">
            {startersByPosition.def.map((player) => (
              <PlayerPointsCard
                key={player.id}
                player={player}
                teamShortName={getTeamShortName(player.team)}
                gameweek={gameweek}
                onClick={() => onPlayerClick?.(player)}
              />
            ))}
          </div>

          {/* Goalkeeper */}
          <div className="flex justify-center">
            {startersByPosition.gk.map((player) => (
              <PlayerPointsCard
                key={player.id}
                player={player}
                teamShortName={getTeamShortName(player.team)}
                gameweek={gameweek}
                onClick={() => onPlayerClick?.(player)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Substitutes Bench */}
      {subs.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-[var(--foreground-muted)] mb-3">Substitutes</h4>
          <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar px-2">
            {subs.map((player) => (
              <PlayerPointsCard
                key={player.id}
                player={player}
                teamShortName={getTeamShortName(player.team)}
                gameweek={gameweek}
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

interface PlayerPointsCardProps {
  player: PlayerWithPoints;
  teamShortName: string;
  gameweek: number;
  onClick?: () => void;
  isSub?: boolean;
}

function PlayerPointsCard({ player, teamShortName, gameweek, onClick, isSub }: PlayerPointsCardProps) {
  const points = player.gameweekPoints;
  const hasPlayed = points && points.minutes > 0;
  const basePoints = points?.total_points || 0;
  
  // Apply captain multiplier (2x for captain, 2x for VC if captain didn't play)
  // Note: For VC multiplier logic, we'd need access to captain's data which is handled at parent level
  // Here we just apply 2x if player is captain
  const displayPoints = player.is_captain ? basePoints * 2 : basePoints;

  // Determine badge color based on points (using display points for color)
  const getPointsColor = (pts: number): string => {
    if (pts === 0 || !hasPlayed) return 'bg-gray-500';
    if (pts >= 8) return 'bg-green-500';
    if (pts >= 5) return 'bg-yellow-500';
    if (pts >= 2) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // Build tooltip content with point breakdown
  const buildTooltipContent = () => {
    if (!points) {
      return (
        <div className="text-center">
          <p className="font-medium">{player.web_name}</p>
          <p className="text-xs mt-1 text-[var(--foreground-muted)]">Not played yet</p>
        </div>
      );
    }

    const breakdown = [];
    
    // Goals
    if (points.goals_scored > 0) {
      const goalPoints = points.goals_scored * (player.element_type === 1 || player.element_type === 2 ? 6 : player.element_type === 3 ? 5 : 4);
      breakdown.push(`${points.goals_scored} goal${points.goals_scored > 1 ? 's' : ''} (+${goalPoints} pts)`);
    }
    
    // Assists
    if (points.assists > 0) {
      breakdown.push(`${points.assists} assist${points.assists > 1 ? 's' : ''} (+${points.assists * 3} pts)`);
    }
    
    // Clean sheets
    if (points.clean_sheets > 0) {
      const csPoints = player.element_type === 1 ? 4 : player.element_type === 2 ? 1 : 0;
      if (csPoints > 0) {
        breakdown.push(`Clean sheet (+${csPoints} pt${csPoints > 1 ? 's' : ''})`);
      }
    }
    
    // Saves (goalkeepers only)
    if (points.saves > 0 && player.element_type === 1) {
      const savePoints = Math.floor(points.saves / 3);
      if (savePoints > 0) {
        breakdown.push(`${points.saves} saves (+${savePoints} pt${savePoints > 1 ? 's' : ''})`);
      }
    }
    
    // Goals conceded (goalkeepers/defenders)
    if (points.goals_conceded > 0 && (player.element_type === 1 || player.element_type === 2)) {
      const concededPoints = player.element_type === 1 ? Math.floor(points.goals_conceded / 2) : 0;
      if (concededPoints > 0) {
        breakdown.push(`${points.goals_conceded} goals conceded (-${concededPoints} pt${concededPoints > 1 ? 's' : ''})`);
      }
    }
    
    // Appearance points
    if (points.minutes > 0) {
      if (points.minutes >= 60) {
        breakdown.push(`60+ minutes (+2 pts)`);
      } else {
        breakdown.push(`Appearance (+1 pt)`);
      }
    }
    
    // Bonus points
    if (points.bonus > 0) {
      breakdown.push(`Bonus points (+${points.bonus} pt${points.bonus > 1 ? 's' : ''})`);
    }
    
    // Cards
    if (points.yellow_cards > 0) {
      breakdown.push(`Yellow card${points.yellow_cards > 1 ? 's' : ''} (-${points.yellow_cards} pt${points.yellow_cards > 1 ? 's' : ''})`);
    }
    if (points.red_cards > 0) {
      const redCardPoints = player.element_type === 1 ? 3 : 2;
      breakdown.push(`Red card (-${redCardPoints} pts)`);
    }

    return (
      <div className="text-center max-w-xs">
        <p className="font-medium">{player.web_name}</p>
        <p className="text-lg font-bold mt-1">{displayPoints} pts</p>
        {player.is_captain && (
          <p className="text-xs text-[var(--pl-magenta)] font-medium">Captain (points ×2)</p>
        )}
        {breakdown.length > 0 ? (
          <div className="mt-2 text-xs text-left space-y-1">
            {breakdown.map((item, idx) => (
              <div key={idx}>{item}</div>
            ))}
          </div>
        ) : (
          <p className="text-xs mt-1 text-[var(--foreground-muted)]">No additional points</p>
        )}
        {points.minutes > 0 && (
          <p className="text-xs mt-2 text-[var(--foreground-muted)]">{points.minutes} minutes played</p>
        )}
      </div>
    );
  };

  // Determine badge content
  let badgeContent = '-';
  let badgeColorClass = 'bg-gray-500';

  if (!hasPlayed) {
    badgeContent = 'Not Played';
    badgeColorClass = 'bg-gray-500';
  } else {
    badgeContent = `${displayPoints} pts`;
    badgeColorClass = getPointsColor(displayPoints);
  }

  return (
    <Tooltip content={buildTooltipContent()}>
      <button
        onClick={onClick}
        className={cn(
          'relative flex flex-col items-center',
          'transition-transform duration-200',
          'hover:scale-105',
          isSub && 'opacity-80'
        )}
      >
        {/* Kit & Name Container */}
        <div className="relative mb-8">
          {/* Captain Badge */}
          {player.is_captain && (
            <div className="absolute -top-2 -right-2 z-20">
              <CaptainBadge type="C" size="sm" />
            </div>
          )}
          {player.is_vice_captain && (
            <div className="absolute -top-2 -right-2 z-20">
              <CaptainBadge type="V" size="sm" />
            </div>
          )}
          
          {/* Jersey */}
          <PlayerKit teamShortName={teamShortName} size="lg" className="drop-shadow-xl" />
          
          {/* Name Overlay - Sleek black gradient at bottom of jersey */}
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

        {/* Points Badge - Floating below */}
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
  );
}

import { FPLPlayer } from '@/types/fpl';
import { formatPrice, getPositionShortName } from '@/lib/utils';
import { PlayerInjuryIcon } from '@/components/ui/PlayerInjuryIcon';

interface PlayerCardProps {
  player: FPLPlayer;
  onClick?: () => void;
  selected?: boolean;
}

export function PlayerCard({ player, onClick, selected }: PlayerCardProps) {
  return (
    <div
      onClick={onClick}
      className={`p-3 border rounded-lg cursor-pointer transition-all ${
        selected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-center gap-2">
        <div className="font-semibold text-sm">{player.web_name}</div>
        <PlayerInjuryIcon player={player} size="sm" />
      </div>
      <div className="text-xs text-gray-500 mt-1">
        {getPositionShortName(player.element_type)} • {formatPrice(player.now_cost)}
      </div>
      <div className="text-xs text-gray-400 mt-1">
        {player.total_points} pts
      </div>
    </div>
  );
}


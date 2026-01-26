import { PlayerWithFixtures } from '@/types/fpl';
import { DifficultyIndicator } from './DifficultyIndicator';
import { formatPrice, getPositionShortName } from '@/lib/utils';

interface PlayerFixtureViewProps {
  player: PlayerWithFixtures;
  gameweeks: number[];
}

export function PlayerFixtureView({ player, gameweeks }: PlayerFixtureViewProps) {
  return (
    <div className="border-b border-gray-200 py-3">
      <div className="flex items-center gap-4 mb-2">
        <div className="flex-1">
          <div className="font-semibold text-gray-900">{player.web_name}</div>
          <div className="text-sm text-gray-500">
            {getPositionShortName(player.element_type)} • {formatPrice(player.now_cost)}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-2 mt-2">
        {gameweeks.map((gw) => {
          const fixture = player.upcomingFixtures.find((f) => f.gameweek === gw);
          if (!fixture) {
            return (
              <div key={gw} className="text-center text-gray-400 text-sm py-2">
                -
              </div>
            );
          }

          return (
            <div
              key={gw}
              className="border border-gray-200 rounded p-2 text-center hover:bg-gray-50 transition-colors"
            >
              <div className="text-xs text-gray-500 mb-1">GW {gw}</div>
              <div className="font-medium text-sm mb-1">
                {fixture.isHome ? 'H' : 'A'}
              </div>
              <div className="text-xs font-semibold mb-1">
                {fixture.opponent.short_name}
              </div>
              <DifficultyIndicator difficulty={fixture.difficulty} size="sm" />
            </div>
          );
        })}
      </div>
    </div>
  );
}


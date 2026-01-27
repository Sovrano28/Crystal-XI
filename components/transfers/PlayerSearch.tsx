'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FPLPlayer } from '@/types/fpl';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface PlayerSearchProps {
  players: FPLPlayer[];
  onSelectPlayer: (player: FPLPlayer) => void;
  className?: string;
}

export function PlayerSearch({ players, onSelectPlayer, className }: PlayerSearchProps) {
  const [query, setQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);

  const filteredPlayers = useMemo(() => {
    return players
      .filter((p) => {
        const matchesQuery =
          p.web_name.toLowerCase().includes(query.toLowerCase()) ||
          p.first_name.toLowerCase().includes(query.toLowerCase()) ||
          p.second_name.toLowerCase().includes(query.toLowerCase());
        
        const matchesPosition = positionFilter ? p.element_type === positionFilter : true;
        const matchesPrice = maxPrice ? p.now_cost <= maxPrice : true;

        return matchesQuery && matchesPosition && matchesPrice;
      })
      .slice(0, 20); // Limit results for performance
  }, [players, query, positionFilter, maxPrice]);

  const positions = [
    { id: 1, label: 'GK', short: 'GKP' },
    { id: 2, label: 'DEF', short: 'DEF' },
    { id: 3, label: 'MID', short: 'MID' },
    { id: 4, label: 'FWD', short: 'FWD' },
  ];

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-col gap-2">
        <Input
          placeholder="Search players..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="bg-[var(--surface-elevated)]"
        />
        
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Button
            size="sm"
            variant={positionFilter === null ? 'primary' : 'outline'}
            onClick={() => setPositionFilter(null)}
            className="whitespace-nowrap"
          >
            All
          </Button>
          {positions.map((pos) => (
            <Button
              key={pos.id}
              size="sm"
              variant={positionFilter === pos.id ? 'primary' : 'outline'}
              onClick={() => setPositionFilter(pos.id)}
              className="whitespace-nowrap"
            >
              {pos.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {filteredPlayers.map((player) => (
          <Card
            key={player.id}
            variant="interactive"
            padding="sm"
            onClick={() => onSelectPlayer(player)}
            className="flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://resources.premierleague.com/premierleague/photos/players/110x140/p${player.photo.replace('.jpg', '.png')}`}
                  alt={player.web_name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-semibold text-sm text-[var(--foreground)]">{player.web_name}</p>
                <div className="flex items-center gap-2 text-xs text-[var(--foreground-muted)]">
                  <span>{positions.find(p => p.id === player.element_type)?.short}</span>
                  <span>•</span>
                  <span>{player.total_points} PTS</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <p className="font-bold text-[var(--foreground)]">£{(player.now_cost / 10).toFixed(1)}m</p>
              <Badge variant={player.form > '5' ? 'success' : 'default'} size="sm">
                Form: {player.form}
              </Badge>
            </div>
          </Card>
        ))}
        
        {filteredPlayers.length === 0 && (
          <div className="text-center py-8 text-[var(--foreground-muted)]">
            No players found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}

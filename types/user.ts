// User and Team Management Types

export interface User {
  id: string;
  email: string;
  name?: string;
  fplTeamId?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserTeam {
  userId: string;
  fplTeamId: number;
  teamName?: string;
  autoSync: boolean;
  preferences: {
    defaultFormation?: string;
    showPrices?: boolean;
    showStats?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface SavedTeam {
  id: string;
  userId: string;
  name: string;
  formation: string;
  players: Array<{
    playerId: number;
    position: number; // 1-15 (1-11 starters, 12-15 bench)
    isCaptain: boolean;
    isViceCaptain: boolean;
  }>;
  gameweek: number;
  transfers?: Array<{
    playerIn: number;
    playerOut: number;
    gameweek: number;
  }>;
  chips?: Array<{
    chip: 'wildcard' | 'freehit' | 'benchboost' | 'triplecaptain';
    gameweek: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}


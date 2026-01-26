// FPL API Data Types

export interface FPLPlayer {
  id: number;
  web_name: string;
  first_name: string;
  second_name: string;
  team: number;
  element_type: number; // 1=GK, 2=DEF, 3=MID, 4=FWD
  now_cost: number; // Price in tenths (divide by 10)
  total_points: number;
  points_per_game: string;
  selected_by_percent: string;
  form: string;
  news: string;
  news_added?: string;
  chance_of_playing_this_round?: number;
  chance_of_playing_next_round?: number;
  value_form: string;
  value_season: string;
  cost_change_start: number;
  cost_change_event: number;
  cost_change_start_fall: number;
  cost_change_event_fall: number;
  in_dreamteam: boolean;
  dreamteam_count: number;
  photo: string;
  transfers_in: number;
  transfers_out: number;
  transfers_in_event: number;
  transfers_out_event: number;
  goals_scored: number;
  assists: number;
  clean_sheets: number;
  goals_conceded: number;
  own_goals: number;
  penalties_saved: number;
  penalties_missed: number;
  yellow_cards: number;
  red_cards: number;
  saves: number;
  bonus: number;
  bps: number;
  influence: string;
  creativity: string;
  threat: string;
  ict_index: string;
  starts: number;
  expected_goals: string;
  expected_assists: string;
  expected_goal_involvements: string;
  expected_goals_conceded: string;
  influence_rank: number;
  influence_rank_type: number;
  creativity_rank: number;
  creativity_rank_type: number;
  threat_rank: number;
  threat_rank_type: number;
  ict_index_rank: number;
  ict_index_rank_type: number;
  corners_and_indirect_freekicks_order?: number;
  corners_and_indirect_freekicks_text?: string;
  direct_freekicks_order?: number;
  direct_freekicks_text?: string;
  penalties_order?: number;
  penalties_text?: string;
}

export interface FPLTeam {
  id: number;
  name: string;
  short_name: string;
  code: number;
  strength: number;
  strength_overall_home: number;
  strength_overall_away: number;
  strength_attack_home: number;
  strength_attack_away: number;
  strength_defence_home: number;
  strength_defence_away: number;
}

export interface FPLEvent {
  id: number;
  name: string;
  deadline_time: string;
  average_entry_score: number;
  finished: boolean;
  data_checked: boolean;
  highest_scoring_entry?: number;
  deadline_time_epoch: number;
  deadline_time_game_offset: number;
  highest_score?: number;
  is_previous: boolean;
  is_current: boolean;
  is_next: boolean;
  chip_plays: Array<{
    chip_name: string;
    num_played: number;
  }>;
  most_selected?: number;
  most_transferred_in?: number;
  top_element?: number;
  top_element_info?: {
    id: number;
    points: number;
  };
  transfers_made: number;
  most_captained?: number;
  most_vice_captained?: number;
}

export interface FPLFixture {
  id: number;
  code: number;
  team_h: number; // Home team ID
  team_h_score?: number;
  team_a: number; // Away team ID
  team_a_score?: number;
  event: number; // Gameweek number
  finished: boolean;
  minutes: number;
  provisional_start_time: boolean;
  kickoff_time: string;
  event_name: string;
  is_home: boolean;
  difficulty: number; // FDR (1-5)
  team_h_difficulty: number;
  team_a_difficulty: number;
  pulse_id: number;
}

export interface FPLBootstrapStatic {
  events: FPLEvent[];
  game_settings: any;
  phases: any[];
  teams: FPLTeam[];
  elements: FPLPlayer[];
  element_stats: any[];
  element_types: Array<{
    id: number;
    plural_name: string;
    plural_name_short: string;
    singular_name: string;
    singular_name_short: string;
    squad_select: number;
    squad_min_play: number;
    squad_max_play: number;
    ui_shirt_specific: boolean;
    sub_positions_locked: number[];
    element_count: number;
  }>;
  total_players: number;
}

export interface FPLTeamPicks {
  active_chip?: string;
  automatic_subs: Array<{
    entry: number;
    element_in: number;
    element_out: number;
    event: number;
  }>;
  entry_history: {
    event: number;
    points: number;
    total_points: number;
    rank: number;
    rank_sort: number;
    overall_rank: number;
    bank: number;
    value: number;
    event_transfers: number;
    event_transfers_cost: number;
    points_on_bench: number;
  };
  picks: Array<{
    element: number;
    position: number;
    multiplier: number;
    is_captain: boolean;
    is_vice_captain: boolean;
  }>;
}

export interface PlayerFixture {
  gameweek: number;
  opponent: FPLTeam;
  isHome: boolean;
  difficulty: number; // FDR 1-5
  fixture: FPLFixture;
}

export interface PlayerWithFixtures extends FPLPlayer {
  upcomingFixtures: PlayerFixture[];
}


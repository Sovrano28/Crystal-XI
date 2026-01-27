export const teamColors: Record<string, { primary: string; secondary: string; text: string }> = {
  ARS: { primary: '#EF0107', secondary: '#FFFFFF', text: '#FFFFFF' },
  AVL: { primary: '#670E36', secondary: '#95BJE5', text: '#95BJE5' },
  BOU: { primary: '#DA291C', secondary: '#000000', text: '#FFFFFF' },
  BRE: { primary: '#E30613', secondary: '#FFFFFF', text: '#FFFFFF' }, // Stripes usually, but solid for icon
  BHA: { primary: '#0057B8', secondary: '#FFFFFF', text: '#FFFFFF' },
  CHE: { primary: '#034694', secondary: '#FFFFFF', text: '#FFFFFF' },
  CRY: { primary: '#1B458F', secondary: '#C4122E', text: '#FFFFFF' },
  EVE: { primary: '#003399', secondary: '#FFFFFF', text: '#FFFFFF' },
  FUL: { primary: '#FFFFFF', secondary: '#000000', text: '#000000' },
  IPS: { primary: '#0054A6', secondary: '#FFFFFF', text: '#FFFFFF' },
  LEI: { primary: '#0053A0', secondary: '#FFFFFF', text: '#FFFFFF' },
  LIV: { primary: '#C8102E', secondary: '#FFFFFF', text: '#FFFFFF' },
  MCI: { primary: '#6CABDD', secondary: '#FFFFFF', text: '#FFFFFF' },
  MUN: { primary: '#DA291C', secondary: '#FFFFFF', text: '#FFFFFF' },
  NEW: { primary: '#241F20', secondary: '#FFFFFF', text: '#FFFFFF' },
  NFO: { primary: '#DD0000', secondary: '#FFFFFF', text: '#FFFFFF' },
  SOU: { primary: '#D71920', secondary: '#FFFFFF', text: '#FFFFFF' },
  TOT: { primary: '#FFFFFF', secondary: '#132257', text: '#132257' },
  WHU: { primary: '#7A263A', secondary: '#1BB1E7', text: '#FFFFFF' },
  WOL: { primary: '#FDB913', secondary: '#231F20', text: '#231F20' },
  // Fallback
  DEFAULT: { primary: '#37003c', secondary: '#00ff85', text: '#FFFFFF' },
};

export const getTeamColors = (shortName: string) => {
  return teamColors[shortName] || teamColors.DEFAULT;
};

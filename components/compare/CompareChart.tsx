'use client';

import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { FPLPlayer, FPLTeam } from '@/types/fpl';

interface CompareChartProps {
  mode: 'players' | 'teams';
  selectedPlayers: FPLPlayer[];
  selectedTeams: FPLTeam[];
  allPlayers?: FPLPlayer[];
}

const COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6']; // Indigo, Emerald, Rose, Amber, Violet

// Custom tooltips styling for dark mode compatibility
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 dark:bg-slate-900/95 p-3 rounded-lg shadow-xl border border-slate-100 dark:border-slate-800 text-sm backdrop-blur-md">
        <p className="font-bold text-slate-800 dark:text-slate-200 mb-2 border-b border-slate-200 dark:border-slate-700 pb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center gap-2 my-1">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-600 dark:text-slate-300 font-medium">{entry.name}:</span>
            <span className="text-slate-900 dark:text-white font-bold ml-auto">{Number(entry.value).toFixed(2)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function CompareChart({ mode, selectedPlayers, selectedTeams, allPlayers }: CompareChartProps) {
  if (mode === 'players' && selectedPlayers.length === 0) return null;
  if (mode === 'teams' && selectedTeams.length === 0) return null;

  let chartData: Record<string, string | number>[] = [];
  let dataKeys: string[] = [];

  const parseMetric = (val: string | number | undefined) => {
    if (val === undefined) return 0;
    const parsed = parseFloat(val as string);
    return isNaN(parsed) ? 0 : parsed;
  };

  if (mode === 'players') {
    dataKeys = selectedPlayers.map(p => p.web_name);
    
    chartData = [
      {
        subject: 'Threat (xG)',
        ...selectedPlayers.reduce((acc, p) => ({ 
          ...acc, 
          [p.web_name]: parseMetric(p.expected_goals_per_90 || p.expected_goals) 
        }), {})
      },
      {
        subject: 'Creativity (xA)',
        ...selectedPlayers.reduce((acc, p) => ({ 
          ...acc, 
          [p.web_name]: parseMetric(p.expected_assists_per_90 || p.expected_assists) 
        }), {})
      },
      {
        subject: 'Goal Inv. (xGI)',
        ...selectedPlayers.reduce((acc, p) => ({ 
          ...acc, 
          [p.web_name]: parseMetric(p.expected_goal_involvements_per_90 || p.expected_goal_involvements) 
        }), {})
      },
      {
        subject: 'Form',
        ...selectedPlayers.reduce((acc, p) => ({ 
          ...acc, 
          [p.web_name]: parseMetric(p.form) 
        }), {})
      },
      {
        subject: 'PPG',
        ...selectedPlayers.reduce((acc, p) => ({ 
          ...acc, 
          [p.web_name]: parseMetric(p.points_per_game) 
        }), {})
      }
    ];

  } else {
    // Mode: Teams
    dataKeys = selectedTeams.map(t => t.short_name);
    
    chartData = [
      {
        subject: 'Total xG',
        ...selectedTeams.reduce((acc, t) => {
          const teamPlayers = allPlayers?.filter(p => p.team === t.id) || [];
          const totalXg = teamPlayers.reduce((sum, p) => sum + parseMetric(p.expected_goals), 0);
          return { ...acc, [t.short_name]: totalXg };
        }, {})
      },
      {
        subject: 'Total xA',
        ...selectedTeams.reduce((acc, t) => {
          const teamPlayers = allPlayers?.filter(p => p.team === t.id) || [];
          const totalXa = teamPlayers.reduce((sum, p) => sum + parseMetric(p.expected_assists), 0);
          return { ...acc, [t.short_name]: totalXa };
        }, {})
      },
      {
        subject: 'Attack (Home)',
        ...selectedTeams.reduce((acc, t) => ({ ...acc, [t.short_name]: t.strength_attack_home }), {})
      },
      {
        subject: 'Attack (Away)',
        ...selectedTeams.reduce((acc, t) => ({ ...acc, [t.short_name]: t.strength_attack_away }), {})
      },
      {
        subject: 'Defence (Home)',
        ...selectedTeams.reduce((acc, t) => ({ ...acc, [t.short_name]: t.strength_defence_home }), {})
      },
      {
        subject: 'Defence (Away)',
        ...selectedTeams.reduce((acc, t) => ({ ...acc, [t.short_name]: t.strength_defence_away }), {})
      },
      {
        subject: 'Overall Str.',
        ...selectedTeams.reduce((acc, t) => ({ ...acc, [t.short_name]: Math.round((t.strength_overall_home + t.strength_overall_away) / 2) }), {})
      }
    ];
  }

  return (
    <div className="w-full h-[400px] flex items-center justify-center p-4 bg-white/50 dark:bg-slate-900/50 rounded-3xl border border-white/20 dark:border-slate-800/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] dark:shadow-none backdrop-blur-xl">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} vertical={false} />
          <XAxis 
            dataKey="subject" 
            tick={{ fill: '#64748b', fontSize: 13, fontWeight: 600 }} 
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            tick={{ fill: '#94a3b8', fontSize: 12 }} 
            axisLine={false}
            tickLine={false}
          />
          <Tooltip cursor={{ fill: '#e2e8f0', opacity: 0.2 }} content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom"
            wrapperStyle={{ paddingTop: '20px' }}
            content={() => (
              <div className="flex justify-center items-center gap-4 text-sm font-semibold flex-wrap">
                {dataKeys.map((key, index) => (
                  <div key={`item-${index}`} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-slate-700 dark:text-slate-300">{key}</span>
                  </div>
                ))}
              </div>
            )}
          />
          
          {dataKeys.map((key, index) => (
            <Bar 
              key={key} 
              dataKey={key} 
              fill={COLORS[index % COLORS.length]} 
              radius={[4, 4, 0, 0]}
              maxBarSize={60}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

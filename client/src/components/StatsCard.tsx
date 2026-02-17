import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
  color?: string;
}

export default function StatsCard({ title, value, icon, trend, trendUp, color = 'var(--primary)' }: StatsCardProps) {
  return (
    <div className="stats-card">
      <div className="stats-card-content">
        <span className="stats-label">{title}</span>
        <span className="stats-value">{value}</span>
        {trend && (
          <span className={`stats-trend ${trendUp ? 'up' : 'down'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
      <div className="stats-icon" style={{ background: `${color}15`, color }}>
        {icon}
      </div>
    </div>
  );
}

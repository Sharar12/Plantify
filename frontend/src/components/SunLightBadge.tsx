import React from 'react';
import { Sun, SunDim, SunMedium } from 'lucide-react';

export interface SunLightBadgeProps {
  level: 'low' | 'medium' | 'high';
}

export default function SunLightBadge({ level }: SunLightBadgeProps) {
  const configs = {
    low: {
      icon: <SunDim className="w-4 h-4 text-slate-600" />,
      text: "Low Light",
      bg: "bg-slate-100 text-slate-700 border-slate-200",
    },
    medium: {
      icon: <SunMedium className="w-4 h-4 text-amber-500" />,
      text: "Bright Indirect",
      bg: "bg-amber-50 text-amber-700 border-amber-200",
    },
    high: {
      icon: <Sun className="w-4 h-4 text-orange-500" />,
      text: "Full Sunlight",
      bg: "bg-orange-50 text-orange-700 border-orange-200",
    },
  };

  const curr = configs[level] || configs.medium;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border ${curr.bg}`}>
      {curr.icon}
      {curr.text}
    </span>
  );
}

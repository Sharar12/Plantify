import React from 'react';
import { ShieldCheck } from 'lucide-react';

export interface PlantHealthBadgeProps {
  grade?: 'A+' | 'A' | 'B';
}

export default function PlantHealthBadge({ grade = 'A+' }: PlantHealthBadgeProps) {
  const configs = {
    'A+': { label: 'Nursery Grade A+ (Pest Free)', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    'A': { label: 'Nursery Grade A (Thriving)', bg: 'bg-teal-50 text-teal-800 border-teal-200' },
    'B': { label: 'Healthy Rooted Starter', bg: 'bg-slate-50 text-slate-800 border-slate-200' },
  };

  const curr = configs[grade] || configs['A+'];

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${curr.bg}`}>
      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
      {curr.label}
    </span>
  );
}

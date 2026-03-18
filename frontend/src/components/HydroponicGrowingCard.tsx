import React from 'react';
import { Droplet, RefreshCw } from 'lucide-react';

export interface HydroponicGrowingCardProps {
  plantName: string;
  waterChangeDays?: number;
  nutrientDropsPerMonth?: number;
}

export default function HydroponicGrowingCard({
  plantName,
  waterChangeDays = 7,
  nutrientDropsPerMonth = 2,
}: HydroponicGrowingCardProps) {
  return (
    <div className="p-5 rounded-3xl bg-sky-50/70 border border-sky-200 text-sky-950 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-sm text-sky-900">
          <Droplet className="w-4 h-4 text-sky-600" />
          Water Propagation & Hydroponics
        </div>
        <span className="text-[11px] font-semibold bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-full">
          Hydro Friendly
        </span>
      </div>
      <p className="text-xs text-sky-900/80 leading-relaxed">
        <strong>{plantName}</strong> roots vigorously in clear glass vessels with filtered water.
      </p>
      <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
        <div className="p-2.5 bg-white/80 rounded-2xl border border-sky-100 flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5 text-sky-600" />
          <span>Change water every {waterChangeDays} days</span>
        </div>
        <div className="p-2.5 bg-white/80 rounded-2xl border border-sky-100 flex items-center gap-2">
          <Droplet className="w-3.5 h-3.5 text-sky-600" />
          <span>{nutrientDropsPerMonth} drops liquid food/mo</span>
        </div>
      </div>
    </div>
  );
}

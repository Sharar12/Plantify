import React from 'react';
import { Droplet } from 'lucide-react';

export interface WateringIndicatorProps {
  frequency: 'daily' | 'biweekly' | 'weekly' | 'dry_out';
  showLabel?: boolean;
}

export default function WateringIndicator({ frequency, showLabel = true }: WateringIndicatorProps) {
  const dropCounts: Record<string, number> = {
    daily: 3,
    biweekly: 2,
    weekly: 1,
    dry_out: 1,
  };
  const count = dropCounts[frequency] || 1;

  const labels: Record<string, string> = {
    daily: "High (Daily)",
    biweekly: "Moderate (2-3x/week)",
    weekly: "Low (Weekly)",
    dry_out: "Sparse (Dry Soil)",
  };

  return (
    <div className="flex items-center gap-2" title={`Watering: ${labels[frequency]}`}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3].map((idx) => (
          <Droplet
            key={idx}
            className={`w-4 h-4 ${
              idx <= count
                ? 'fill-sky-500 text-sky-500'
                : 'fill-slate-100 text-slate-300'
            }`}
          />
        ))}
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-slate-600">{labels[frequency]}</span>
      )}
    </div>
  );
}

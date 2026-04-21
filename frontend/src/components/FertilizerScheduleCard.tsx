import React from 'react';
import { Shovel, AlertTriangle } from 'lucide-react';

export interface FertilizerScheduleCardProps {
  scheduleText: string;
  isOrganic?: boolean;
}

export default function FertilizerScheduleCard({ scheduleText, isOrganic = true }: FertilizerScheduleCardProps) {
  return (
    <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
      <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
        <Shovel className="w-4 h-4 text-amber-700" />
        Nutrient & Fertilizer Feeding Schedule
      </div>
      <p className="text-xs text-amber-950 leading-relaxed">{scheduleText}</p>
      {isOrganic && (
        <div className="text-[11px] text-amber-800 font-medium flex items-center gap-1.5 pt-1">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          Always water soil before applying liquid fertilizers to prevent root burn.
        </div>
      )}
    </div>
  );
}

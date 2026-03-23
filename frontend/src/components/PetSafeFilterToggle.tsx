import React from 'react';
import { Dog, ShieldCheck } from 'lucide-react';

export interface PetSafeFilterToggleProps {
  isPetSafeOnly: boolean;
  onToggle: (checked: boolean) => void;
}

export default function PetSafeFilterToggle({ isPetSafeOnly, onToggle }: PetSafeFilterToggleProps) {
  return (
    <div className="p-3.5 rounded-2xl border border-purple-200 bg-purple-50/50 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0">
          <Dog className="w-4 h-4" />
        </div>
        <div>
          <div className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
            Pet & Child Friendly
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="text-[11px] text-purple-700">Filter ASPCA certified non-toxic plants</div>
        </div>
      </div>
      <input
        type="checkbox"
        checked={isPetSafeOnly}
        onChange={(e) => onToggle(e.target.checked)}
        className="w-4 h-4 text-purple-600 rounded border-purple-300 focus:ring-purple-500 cursor-pointer"
      />
    </div>
  );
}

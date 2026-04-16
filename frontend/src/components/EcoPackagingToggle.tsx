import React from 'react';
import { Leaf } from 'lucide-react';

export interface EcoPackagingToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export default function EcoPackagingToggle({ enabled, onToggle }: EcoPackagingToggleProps) {
  return (
    <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
          <Leaf className="w-5 h-5" />
        </div>
        <div>
          <div className="text-sm font-bold text-emerald-950">100% Biodegradable Packaging</div>
          <div className="text-xs text-emerald-700 mt-0.5">
            Recycled jute wrapping, zero plastic tape, biodegradable soil pot sleeves.
          </div>
        </div>
      </div>
      <input
        type="checkbox"
        checked={enabled}
        onChange={(e) => onToggle(e.target.checked)}
        className="w-5 h-5 text-emerald-600 rounded border-emerald-300 focus:ring-emerald-500 cursor-pointer"
      />
    </div>
  );
}

'use client';

import React from 'react';

export interface PotSizeOption {
  id: string;
  name: string;
  diameterCm: number;
  priceDelta: number;
}

export interface PotSizeSelectorProps {
  sizes: PotSizeOption[];
  selectedId: string;
  onSelect: (size: PotSizeOption) => void;
}

export default function PotSizeSelector({ sizes, selectedId, onSelect }: PotSizeSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
        Select Planter Size
      </label>
      <div className="grid grid-cols-3 gap-2.5">
        {sizes.map((s) => {
          const isSelected = s.id === selectedId;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(s)}
              className={`p-3 rounded-2xl border text-center transition ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="text-sm font-bold">{s.name}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.diameterCm} cm pot</div>
              {s.priceDelta > 0 && (
                <div className="text-xs font-semibold text-emerald-600 mt-1">
                  +{s.priceDelta} ৳
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

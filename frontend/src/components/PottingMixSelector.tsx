'use client';

import React from 'react';

export interface SoilMix {
  id: string;
  name: string;
  description: string;
  price: number;
}

export interface PottingMixSelectorProps {
  selectedMixId: string;
  onSelect: (mix: SoilMix) => void;
}

export default function PottingMixSelector({ selectedMixId, onSelect }: PottingMixSelectorProps) {
  const mixes: SoilMix[] = [
    { id: 'standard', name: 'Standard Tropical Loam', description: 'Cocopeat, vermicompost, and garden soil', price: 0 },
    { id: 'aroid', name: 'Premium Chunky Aroid Mix', description: 'Pine bark, perlite, charcoal, and coco chips', price: 150 },
    { id: 'succulent', name: 'Gritty Succulent & Cactus Blend', description: 'Pumice, coarse sand, and volcanic grit', price: 120 },
  ];

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
        Select Potting Soil Medium
      </label>
      <div className="space-y-2">
        {mixes.map((mix) => {
          const isSelected = mix.id === selectedMixId;
          return (
            <div
              key={mix.id}
              onClick={() => onSelect(mix)}
              className={`p-3 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50/40 text-emerald-950'
                  : 'border-slate-200 hover:border-slate-300 text-slate-800'
              }`}
            >
              <div>
                <div className="text-sm font-semibold">{mix.name}</div>
                <div className="text-xs text-slate-500 mt-0.5">{mix.description}</div>
              </div>
              <div className="text-sm font-bold text-emerald-700">
                {mix.price === 0 ? 'Included' : `+${mix.price} ৳`}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

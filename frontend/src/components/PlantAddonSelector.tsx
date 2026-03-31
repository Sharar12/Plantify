import React from 'react';
import { Shovel, Sparkles, Bug } from 'lucide-react';

export interface AddonItem {
  id: string;
  name: string;
  price: number;
  icon: 'soil' | 'spray' | 'feed';
}

export interface PlantAddonSelectorProps {
  selectedIds: string[];
  onToggle: (id: string) => void;
}

export default function PlantAddonSelector({ selectedIds, onToggle }: PlantAddonSelectorProps) {
  const addons: AddonItem[] = [
    { id: 'soil', name: 'Organic Perlite Soil Mix (2kg)', price: 120, icon: 'soil' },
    { id: 'feed', name: 'Slow-Release Plant Food Spikes', price: 90, icon: 'feed' },
    { id: 'spray', name: 'Neem Oil Pest Defense Spray', price: 150, icon: 'spray' },
  ];

  return (
    <div className="space-y-2.5">
      <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
        Frequently Added Plant Care Kits
      </h4>
      <div className="space-y-2">
        {addons.map((item) => {
          const checked = selectedIds.includes(item.id);
          return (
            <label
              key={item.id}
              className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition ${
                checked ? 'border-emerald-500 bg-emerald-50/40' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(item.id)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <span className="text-sm font-medium text-slate-800">{item.name}</span>
              </div>
              <span className="text-sm font-bold text-emerald-700">+{item.price} ৳</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

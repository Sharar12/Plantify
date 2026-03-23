'use client';

import React, { useState } from 'react';
import { Sun, Compass } from 'lucide-react';

export default function SunlightExposureCalculator() {
  const [windowDirection, setWindowDirection] = useState<'north' | 'east' | 'south' | 'west'>('east');

  const directionData = {
    north: { light: 'Low to Medium Indirect', hours: '0-1 Hours direct', ideal: 'Snake Plant, ZZ Plant, Cast Iron' },
    east: { light: 'Gentle Morning Sunlight', hours: '3-4 Hours direct morning', ideal: 'Calathea, Peace Lily, Pothos' },
    south: { light: 'Intense Direct Sunlight', hours: '6+ Hours all-day sun', ideal: 'Succulents, Cacti, Jade, Hibiscus' },
    west: { light: 'Bright Afternoon Sunlight', hours: '4-5 Hours warm afternoon', ideal: 'Monstera, Fiddle Leaf Fig, Croton' },
  };

  const curr = directionData[windowDirection];

  return (
    <div className="p-6 rounded-3xl border border-amber-200 bg-amber-50/40 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-amber-950 text-sm">
          <Sun className="w-5 h-5 text-amber-500" />
          Window Sunlight Orientation Tool
        </div>
        <Compass className="w-4 h-4 text-amber-700" />
      </div>

      <div className="grid grid-cols-4 gap-2">
        {(['north', 'east', 'south', 'west'] as const).map((dir) => (
          <button
            key={dir}
            type="button"
            onClick={() => setWindowDirection(dir)}
            className={`py-2 px-3 text-xs font-bold uppercase rounded-xl border transition ${
              windowDirection === dir
                ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300'
            }`}
          >
            {dir}
          </button>
        ))}
      </div>

      <div className="p-4 rounded-2xl bg-white border border-amber-100 text-xs space-y-1.5">
        <div className="font-semibold text-amber-900">{curr.light} ({curr.hours})</div>
        <div className="text-slate-500">Best Houseplants: <span className="font-medium text-slate-800">{curr.ideal}</span></div>
      </div>
    </div>
  );
}

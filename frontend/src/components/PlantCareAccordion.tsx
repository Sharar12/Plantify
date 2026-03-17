'use client';

import React, { useState } from 'react';
import { ChevronDown, Sun, Droplet, Thermometer, ShieldAlert } from 'lucide-react';

export interface PlantCareAccordionProps {
  lightDesc: string;
  waterDesc: string;
  tempDesc: string;
  toxicityDesc?: string;
}

export default function PlantCareAccordion({
  lightDesc,
  waterDesc,
  tempDesc,
  toxicityDesc,
}: PlantCareAccordionProps) {
  const [openSection, setOpenSection] = useState<string | null>('light');

  const toggle = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const sections = [
    { id: 'light', title: 'Sunlight & Position', icon: <Sun className="w-4 h-4 text-amber-500" />, content: lightDesc },
    { id: 'water', title: 'Watering & Moisture', icon: <Droplet className="w-4 h-4 text-sky-500" />, content: waterDesc },
    { id: 'temp', title: 'Climate & Temperature', icon: <Thermometer className="w-4 h-4 text-rose-500" />, content: tempDesc },
    ...(toxicityDesc ? [{ id: 'toxicity', title: 'Pet & Child Safety', icon: <ShieldAlert className="w-4 h-4 text-purple-500" />, content: toxicityDesc }] : []),
  ];

  return (
    <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 overflow-hidden bg-white">
      {sections.map((sec) => (
        <div key={sec.id} className="transition">
          <button
            type="button"
            onClick={() => toggle(sec.id)}
            className="w-full flex items-center justify-between p-4 text-left font-semibold text-sm text-slate-800 hover:bg-slate-50"
          >
            <span className="flex items-center gap-2.5">
              {sec.icon}
              {sec.title}
            </span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openSection === sec.id ? 'rotate-180' : ''}`} />
          </button>
          {openSection === sec.id && (
            <div className="p-4 pt-0 text-sm text-slate-600 leading-relaxed bg-slate-50/50">
              {sec.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

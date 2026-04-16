'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export default function PlantCareFAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "What should I do if lower leaves turn yellow?",
      a: "Occasional lower leaf loss is natural senescence. However, if multiple leaves yellow simultaneously, it typically indicates overwatering or poor container drainage.",
    },
    {
      q: "How soon should I repot my new plant after delivery?",
      a: "Allow your plant 10-14 days to acclimate to your home's ambient light and humidity before repotting into a permanent container.",
    },
    {
      q: "Is tap water safe for sensitive plants like Calatheas?",
      a: "Chlorinated municipal tap water can cause brown leaf fringes. Leave tap water in an open pitcher for 24 hours to let chlorine dissipate before watering.",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2 text-emerald-800 font-bold text-lg">
        <HelpCircle className="w-5 h-5 text-emerald-600" />
        Frequently Asked Plant Care Questions
      </div>
      {faqs.map((faq, i) => (
        <div key={i} className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
          <button
            onClick={() => setOpenIdx(openIdx === i ? null : i)}
            className="w-full p-4 text-left font-semibold text-sm text-slate-800 flex justify-between items-center hover:bg-slate-50"
          >
            {faq.q}
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openIdx === i ? 'rotate-180' : ''}`} />
          </button>
          {openIdx === i && (
            <div className="p-4 pt-0 text-xs text-slate-600 leading-relaxed bg-slate-50/50">
              {faq.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

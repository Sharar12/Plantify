'use client';

import React from 'react';
import { X, Scissors, CheckCircle2 } from 'lucide-react';

export interface PruningGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  plantName: string;
}

export default function PruningGuideModal({ isOpen, onClose, plantName }: PruningGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-lg">
            <Scissors className="w-5 h-5 text-emerald-600" />
            Pruning Guidelines
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
          <p>Care instructions for trimming <strong>{plantName}</strong>:</p>
          <div className="space-y-2">
            <div className="flex items-start gap-2 p-2.5 bg-slate-50 rounded-2xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>Sanitize shears with 70% rubbing alcohol before every cut to prevent pathogen transfer.</span>
            </div>
            <div className="flex items-start gap-2 p-2.5 bg-slate-50 rounded-2xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>Make clean cuts at a 45-degree angle approximately 1/4 inch above a leaf node.</span>
            </div>
            <div className="flex items-start gap-2 p-2.5 bg-slate-50 rounded-2xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>Remove damaged or yellowing stems at the base to redirect energy into vigorous new foliage.</span>
            </div>
          </div>
        </div>
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}

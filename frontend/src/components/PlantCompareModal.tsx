'use client';

import React from 'react';
import { X } from 'lucide-react';

export interface PlantCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  plantA: { name: string; light: string; water: string; petSafe: boolean };
  plantB: { name: string; light: string; water: string; petSafe: boolean };
}

export default function PlantCompareModal({ isOpen, onClose, plantA, plantB }: PlantCompareModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 className="font-bold text-lg text-slate-800">Compare Houseplants</h3>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="py-4 grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-3 p-3 bg-slate-50 rounded-2xl">
            <div className="font-bold text-slate-900">{plantA.name}</div>
            <div className="text-xs text-slate-600">Light: {plantA.light}</div>
            <div className="text-xs text-slate-600">Water: {plantA.water}</div>
            <div className="text-xs text-emerald-700 font-semibold">{plantA.petSafe ? '✓ Pet Friendly' : '✕ Toxic'}</div>
          </div>
          <div className="space-y-3 p-3 bg-emerald-50/60 rounded-2xl">
            <div className="font-bold text-emerald-950">{plantB.name}</div>
            <div className="text-xs text-slate-600">Light: {plantB.light}</div>
            <div className="text-xs text-slate-600">Water: {plantB.water}</div>
            <div className="text-xs text-emerald-700 font-semibold">{plantB.petSafe ? '✓ Pet Friendly' : '✕ Toxic'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

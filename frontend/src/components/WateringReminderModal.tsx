'use client';

import React from 'react';
import { Droplets } from 'lucide-react';

export interface WateringReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  plantName: string;
}

export default function WateringReminderModal({ isOpen, onClose, plantName }: WateringReminderModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
          <Droplets className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Watering Schedule Saved!</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          We will remind you when it is time to hydrate your <strong>{plantName}</strong> based on seasonal humidity.
        </p>
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition"
        >
          Got it, thank you!
        </button>
      </div>
    </div>
  );
}

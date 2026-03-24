'use client';

import React from 'react';
import { X, Calendar, Bell, Droplet } from 'lucide-react';

export interface PlantCareModalProps {
  isOpen: boolean;
  onClose: () => void;
  plantName: string;
  wateringFrequency: string;
}

export default function PlantCareModal({
  isOpen,
  onClose,
  plantName,
  wateringFrequency,
}: PlantCareModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-emerald-700">
            <Droplet className="w-5 h-5" />
            <h3 className="font-bold text-lg">Care Schedule Reminder</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="py-5 space-y-4 text-sm text-slate-600">
          <p>
            You are setting a watering cadence for <strong>{plantName}</strong> based on the recommended schedule:
          </p>
          <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-2xl flex items-center gap-3">
            <Calendar className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="font-medium">Cadence: {wateringFrequency}</span>
          </div>
          <p className="text-xs text-slate-500">
            Notifications will be stored locally in your browser and synced with your Plantify account reminders.
          </p>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 font-medium">
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl flex items-center gap-2 shadow-sm"
          >
            <Bell className="w-4 h-4" /> Save Reminder
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Stethoscope, X, Send } from 'lucide-react';

export default function PlantDoctorChatDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [msg, setMsg] = useState('');

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-emerald-700 hover:bg-emerald-800 text-white p-3.5 rounded-full shadow-2xl flex items-center gap-2 font-semibold text-sm transition"
      >
        <Stethoscope className="w-5 h-5" />
        Ask Plant Doctor
      </button>

      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white shadow-2xl border-l border-slate-200 flex flex-col">
          <div className="p-4 bg-emerald-800 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-5 h-3 text-emerald-300" />
              <span className="font-bold">Plant Doctor Consultation</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-sm text-slate-600">
            <div className="bg-emerald-50 text-emerald-900 p-3 rounded-2xl rounded-tl-none max-w-xs">
              Hello! Notice yellow leaves or brown spots? Describe what plant you have and we will connect you to a botanist.
            </div>
          </div>
          <div className="p-3 border-t border-slate-200 flex gap-2">
            <input
              type="text"
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="Ask about plant health..."
              className="flex-1 text-sm border border-slate-200 rounded-full px-4 py-2 outline-none focus:border-emerald-600"
            />
            <button className="p-2 rounded-full bg-emerald-700 text-white hover:bg-emerald-800 transition">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

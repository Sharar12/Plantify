import React from 'react';
import { UserCheck } from 'lucide-react';

export default function SpecialistAvailabilityWidget() {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
      </span>
      <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
      2 Botanist Specialists Online
    </div>
  );
}

import React from 'react';
import { Gift } from 'lucide-react';

export interface GiftPlantMessageCardProps {
  message: string;
  senderName: string;
}

export default function GiftPlantMessageCard({ message, senderName }: GiftPlantMessageCardProps) {
  return (
    <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-950 space-y-2">
      <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-emerald-800">
        <Gift className="w-4 h-4 text-emerald-600" />
        Botanical Gift Message Card
      </div>
      <p className="text-xs italic leading-relaxed">"{message}"</p>
      <div className="text-[11px] font-semibold text-right">— With love, {senderName}</div>
    </div>
  );
}

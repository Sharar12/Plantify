import React from 'react';

export default function PlantCardSkeleton() {
  return (
    <div className="border border-slate-100 bg-white rounded-3xl p-4 shadow-sm animate-pulse space-y-3">
      <div className="w-full h-56 bg-slate-200 rounded-2xl" />
      <div className="flex gap-2 pt-1">
        <div className="w-16 h-5 bg-slate-200 rounded-full" />
        <div className="w-20 h-5 bg-slate-200 rounded-full" />
      </div>
      <div className="w-3/4 h-6 bg-slate-200 rounded-md" />
      <div className="w-1/2 h-4 bg-slate-100 rounded-md" />
      <div className="flex items-center justify-between pt-2">
        <div className="w-24 h-7 bg-slate-200 rounded-lg" />
        <div className="w-10 h-10 bg-slate-200 rounded-full" />
      </div>
    </div>
  );
}

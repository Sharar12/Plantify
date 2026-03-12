import React from 'react';
import Link from 'next/link';
import { Sprout } from 'lucide-react';

export interface PlantEmptyStateProps {
  title?: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
}

export default function PlantEmptyState({
  title = "No botanical matches found",
  description = "Try adjusting your sunlight, watering, or category filters to find the perfect plant.",
  actionHref = "/plants",
  actionLabel = "View All Houseplants",
}: PlantEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 shadow-inner">
        <Sprout className="w-10 h-10" />
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
      {actionHref && (
        <Link
          href={actionHref}
          className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition shadow-sm"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

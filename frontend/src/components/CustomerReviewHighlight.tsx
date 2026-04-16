import React from 'react';
import { Star, BadgeCheck } from 'lucide-react';

export interface CustomerReviewHighlightProps {
  reviewerName: string;
  rating: number;
  comment: string;
  plantName: string;
  timeAgo: string;
}

export default function CustomerReviewHighlight({
  reviewerName,
  rating,
  comment,
  plantName,
  timeAgo,
}: CustomerReviewHighlightProps) {
  return (
    <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-slate-900">{reviewerName}</span>
          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
            <BadgeCheck className="w-3 h-3 text-emerald-600" /> Verified Plant Parent
          </span>
        </div>
        <span className="text-xs text-slate-400">{timeAgo}</span>
      </div>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`w-3.5 h-3.5 ${
              s <= rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-slate-600 leading-relaxed italic">"{comment}"</p>
      <div className="text-[11px] font-medium text-emerald-700 pt-1">
        Purchased: {plantName}
      </div>
    </div>
  );
}

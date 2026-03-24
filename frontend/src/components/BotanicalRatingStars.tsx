import React from 'react';
import { Star, Leaf } from 'lucide-react';

export interface BotanicalRatingStarsProps {
  score: number;
  plantHealthScore?: number;
}

export default function BotanicalRatingStars({ score, plantHealthScore }: BotanicalRatingStarsProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i <= Math.round(score)
                ? 'fill-amber-400 text-amber-400'
                : 'fill-slate-100 text-slate-200'
            }`}
          />
        ))}
      </div>
      {plantHealthScore && (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          <Leaf className="w-3 h-3" />
          {plantHealthScore}/5 Health Grade
        </span>
      )}
    </div>
  );
}

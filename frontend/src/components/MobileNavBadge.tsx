import React from 'react';

export interface MobileNavBadgeProps {
  count: number;
}

export default function MobileNavBadge({ count }: MobileNavBadgeProps) {
  if (count <= 0) return null;

  return (
    <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-in zoom-in-50 duration-150">
      {count > 9 ? '9+' : count}
    </span>
  );
}

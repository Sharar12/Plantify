import React from 'react';
import { CheckCircle2, Clock, Truck, Home } from 'lucide-react';

export interface OrderTimelineTrackerProps {
  currentStatus: 'pending' | 'processing' | 'shipped' | 'delivered';
}

export default function OrderTimelineTracker({ currentStatus }: OrderTimelineTrackerProps) {
  const steps = [
    { id: 'pending', label: 'Order Placed', icon: Clock },
    { id: 'processing', label: 'Nursery Prep & Soil Check', icon: CheckCircle2 },
    { id: 'shipped', label: 'Dispatched in Van', icon: Truck },
    { id: 'delivered', label: 'Delivered to Door', icon: Home },
  ];

  const statusIndexMap = { pending: 0, processing: 1, shipped: 2, delivered: 3 };
  const activeIdx = statusIndexMap[currentStatus] ?? 0;

  return (
    <div className="py-6 px-4 bg-slate-50 rounded-3xl border border-slate-100">
      <div className="flex items-center justify-between relative max-w-lg mx-auto">
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-0.5 bg-slate-200 z-0" />
        <div
          className="absolute top-1/2 left-0 -translate-y-1/2 h-0.5 bg-emerald-600 z-0 transition-all duration-500"
          style={{ width: `${(activeIdx / (steps.length - 1)) * 100}%` }}
        />
        {steps.map((step, idx) => {
          const isDone = idx <= activeIdx;
          const Icon = step.icon;
          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition ${
                  isDone
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                    : 'bg-white border-2 border-slate-300 text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className={`text-[11px] font-semibold mt-2 text-center max-w-[80px] ${
                isDone ? 'text-emerald-900' : 'text-slate-400'
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

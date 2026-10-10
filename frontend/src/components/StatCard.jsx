import React from 'react';

export default function StatCard({ title, value, icon: Icon, color = 'blue', subtitle }) {
  const colorMap = {
    blue: {
      bg: 'bg-health-50',
      border: 'border-health-100',
      iconBg: 'bg-health-600',
      text: 'text-health-700',
    },
    green: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      iconBg: 'bg-emerald-600',
      text: 'text-emerald-700',
    },
    amber: {
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      iconBg: 'bg-amber-500',
      text: 'text-amber-700',
    },
    indigo: {
      bg: 'bg-indigo-50',
      border: 'border-indigo-100',
      iconBg: 'bg-indigo-600',
      text: 'text-indigo-700',
    },
    rose: {
      bg: 'bg-rose-50',
      border: 'border-rose-100',
      iconBg: 'bg-rose-500',
      text: 'text-rose-700',
    }
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-500">{title}</span>
        <div className={`w-10 h-10 rounded-xl ${scheme.iconBg} text-white flex items-center justify-center shadow-sm`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-4 flex items-baseline space-x-2">
        <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</span>
      </div>
      {subtitle && (
        <p className="mt-1 text-xs text-slate-400 font-medium">{subtitle}</p>
      )}
    </div>
  );
}

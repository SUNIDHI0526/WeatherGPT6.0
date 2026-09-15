import React from 'react';
import { Gauge, AlertCircle, CheckCircle, Flame, CloudLightning, ShieldCheck } from 'lucide-react';
import { LocalRiskIndex } from '../../types/weather';

interface RiskCardProps {
  risk: LocalRiskIndex;
  compact?: boolean;
}

export const RiskCard: React.FC<RiskCardProps> = ({ risk, compact = false }) => {
  const levelDetails = {
    low: {
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      barBg: 'bg-emerald-500',
      tag: '🟢 Low Risk (0–30)'
    },
    moderate: {
      color: 'text-blue-700',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      barBg: 'bg-blue-500',
      tag: '🟡 Moderate Risk (31–60)'
    },
    high: {
      color: 'text-amber-700',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      barBg: 'bg-amber-500',
      tag: '🟠 High Risk (61–80)'
    },
    very_high: {
      color: 'text-rose-700',
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      barBg: 'bg-rose-500',
      tag: '🔴 Very High Risk (81–100)'
    }
  }[risk.level] || {
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    barBg: 'bg-blue-500',
    tag: '🟡 Moderate Risk'
  };

  return (
    <div className={`w-full bg-white rounded-2xl border ${levelDetails.border} shadow-[0_4px_16px_rgba(0,0,0,0.04)] p-4 text-slate-800`}>
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Gauge className={`w-4 h-4 ${levelDetails.color}`} />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Nagpur Local Risk Index
          </h3>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${levelDetails.border} ${levelDetails.bg} ${levelDetails.color}`}>
          {levelDetails.tag}
        </span>
      </div>

      {/* Hero Score Bar */}
      <div className="mt-3 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-4xl font-extrabold font-['Outfit'] ${levelDetails.color}`}>
              {risk.score}
            </span>
            <span className="text-sm font-semibold text-slate-400">/ 100</span>
            <span className={`ml-2 text-sm font-bold uppercase px-2 py-0.5 rounded-md ${levelDetails.bg} ${levelDetails.color}`}>
              {risk.label}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            {risk.safetyAdvice}
          </p>
        </div>
      </div>

      {/* Visual Progress Track */}
      <div className="mt-3.5">
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
          <div
            className={`h-full ${levelDetails.barBg} transition-all duration-700 rounded-full`}
            style={{ width: `${Math.min(100, Math.max(8, risk.score))}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 font-semibold mt-1">
          <span>0 (Safe)</span>
          <span>30</span>
          <span>60</span>
          <span>100 (Severe)</span>
        </div>
      </div>

      {/* Contributors Breakdown (Show WHY the score was generated) */}
      {!compact && risk.contributors && risk.contributors.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Atmospheric Risk Contributors:
          </h4>
          <ul className="space-y-1.5">
            {risk.contributors.map((c, i) => (
              <li
                key={i}
                className="text-xs text-slate-700 flex items-start gap-2 bg-slate-50/80 p-2 rounded-xl border border-slate-100"
              >
                <span className="shrink-0">{c.slice(0, 2)}</span>
                <span className="font-medium">{c.slice(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Mandatory Regulatory Disclaimer */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-slate-400 flex items-start gap-1">
        <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
        <span>{risk.disclaimer}</span>
      </div>
    </div>
  );
};

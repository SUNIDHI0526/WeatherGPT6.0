import React from 'react';
import { User, CheckCircle2, AlertCircle, Clock, Shield } from 'lucide-react';
import { PersonalAdvice } from '../../types/weather';

interface AdviceCardProps {
  advice: PersonalAdvice;
}

export const AdviceCard: React.FC<AdviceCardProps> = ({ advice }) => {
  const profileLabels: Record<string, { label: string; icon: string }> = {
    student: { label: 'Student Profile', icon: '🎒' },
    commuter: { label: 'Daily Commuter', icon: '🛵' },
    farmer: { label: 'Farmer (Vidarbha / Nagpur)', icon: '🌾' },
    worker: { label: 'Outdoor Worker', icon: '👷' },
    traveller: { label: 'Traveller / Transit', icon: '🧳' },
    event: { label: 'Event Organizer', icon: '🎪' },
    general: { label: 'General Resident', icon: '👤' }
  };

  const meta = profileLabels[advice.profile] || { label: 'Personalized Profile', icon: '👤' };

  return (
    <div className="w-full bg-white rounded-2xl border border-indigo-100 shadow-[0_4px_16px_rgba(99,102,241,0.08)] p-4 text-slate-800">
      {/* Top Banner */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <span className="text-base">{meta.icon}</span>
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            {meta.label}
          </span>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
          advice.riskFactor === 'High'
            ? 'bg-amber-100 text-amber-800 border border-amber-200'
            : (advice.riskFactor === 'Medium' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200')
        }`}>
          {advice.riskFactor} Impact
        </span>
      </div>

      <h4 className="text-sm font-bold text-slate-900 leading-snug">
        {advice.title}
      </h4>

      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
        {advice.summary}
      </p>

      {/* Suggested Precautions */}
      {advice.precautions && advice.precautions.length > 0 && (
        <div className="mt-3">
          <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-indigo-500" />
            Recommended Precautions:
          </p>
          <ul className="space-y-1">
            {advice.precautions.map((p, i) => (
              <li key={i} className="text-xs text-slate-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Safe Windows */}
      {advice.safeWindows && advice.safeWindows.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-teal-600" />
            Optimal Windows:
          </p>
          <div className="space-y-1">
            {advice.safeWindows.map((w, i) => (
              <p key={i} className="text-xs text-slate-600 bg-teal-50/70 text-teal-900 px-2 py-1 rounded-lg border border-teal-100/80 font-medium">
                ⏱️ {w}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

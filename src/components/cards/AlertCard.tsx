import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, Info, Clock, MapPin, CheckCircle2, ChevronDown, ChevronUp, Share2, HelpCircle } from 'lucide-react';
import { AlertData } from '../../types/weather';

interface AlertCardProps {
  alert: AlertData;
  initialExpanded?: boolean;
}

export const AlertCard: React.FC<AlertCardProps> = ({ alert, initialExpanded = true }) => {
  const [expanded, setExpanded] = useState(initialExpanded);

  const severityStyles = {
    severe: {
      border: 'border-rose-300',
      bg: 'bg-rose-50/50',
      badge: 'bg-rose-100 text-rose-800 border-rose-200',
      accent: 'text-rose-600',
      icon: AlertTriangle
    },
    high: {
      border: 'border-amber-300',
      bg: 'bg-amber-50/40',
      badge: 'bg-amber-100 text-amber-800 border-amber-200',
      accent: 'text-amber-600',
      icon: AlertTriangle
    },
    moderate: {
      border: 'border-blue-300',
      bg: 'bg-blue-50/40',
      badge: 'bg-blue-100 text-blue-800 border-blue-200',
      accent: 'text-blue-600',
      icon: Info
    },
    info: {
      border: 'border-slate-300',
      bg: 'bg-slate-50',
      badge: 'bg-slate-100 text-slate-800 border-slate-200',
      accent: 'text-slate-600',
      icon: Info
    }
  }[alert.severity] || {
    border: 'border-amber-300',
    bg: 'bg-amber-50/40',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    accent: 'text-amber-600',
    icon: AlertTriangle
  };

  const Icon = severityStyles.icon;

  return (
    <div className={`w-full rounded-2xl border ${severityStyles.border} ${severityStyles.bg} bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] overflow-hidden transition-all`}>
      {/* Top Banner with Demo / Official Distinction */}
      <div className="px-4 py-2.5 bg-gradient-to-r from-amber-500/10 via-sky-500/5 to-transparent border-b border-amber-200/50 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ShieldAlert className={`w-4 h-4 ${severityStyles.accent}`} />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Explain My Alert
          </span>
        </div>
        <div>
          {alert.isDemo ? (
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300/90 shadow-2xs">
              DEMO DATA (Official SACHET Feed Inactive)
            </span>
          ) : (
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-md bg-rose-600 text-white shadow-2xs">
              OFFICIAL SACHET/IMD ALERT
            </span>
          )}
        </div>
      </div>

      {/* Main Alert Headline */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${severityStyles.badge} uppercase tracking-wider inline-block mb-1.5`}>
              {alert.hazardType} • {alert.severity} Severity
            </span>
            <h3 className="text-base font-bold text-slate-900 leading-snug">
              {alert.title}
            </h3>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors shrink-0"
            aria-label={expanded ? 'Collapse alert explanation' : 'Expand alert explanation'}
          >
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
          {alert.headline}
        </p>

        {/* Structured 7-Point Breakdown (Main SIH Innovation) */}
        {expanded && (
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-3.5">
            {/* 1. What happened? */}
            <div className="bg-slate-50/90 rounded-xl p-3 border border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-[10px] font-bold">1</span>
                What happened?
              </h4>
              <p className="text-xs text-slate-600 mt-1 pl-6 leading-relaxed">
                {alert.whatHappened}
              </p>
            </div>

            {/* 2. Why did I receive this alert? */}
            <div className="bg-slate-50/90 rounded-xl p-3 border border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">2</span>
                Why did I receive this alert?
              </h4>
              <p className="text-xs text-slate-600 mt-1 pl-6 leading-relaxed">
                {alert.whyReceived}
              </p>
            </div>

            {/* 3 & 4. When and Where Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="bg-slate-50/90 rounded-xl p-2.5 border border-slate-100">
                <h4 className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  3. When?
                </h4>
                <p className="text-xs text-slate-800 font-semibold mt-1">
                  {alert.when}
                </p>
              </div>

              <div className="bg-slate-50/90 rounded-xl p-2.5 border border-slate-100">
                <h4 className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  4. Where?
                </h4>
                <p className="text-xs text-slate-800 font-semibold mt-1">
                  {alert.where}
                </p>
              </div>
            </div>

            {/* 5. What could happen? */}
            <div className="bg-amber-50/60 rounded-xl p-3 border border-amber-200/60">
              <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center text-[10px] font-bold">5</span>
                What could happen?
              </h4>
              <p className="text-xs text-amber-800 mt-1 pl-6 leading-relaxed">
                {alert.whatCouldHappen}
              </p>
            </div>

            {/* 6. What should I do? */}
            <div className="bg-emerald-50/60 rounded-xl p-3 border border-emerald-200/60">
              <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-950 flex items-center justify-center text-[10px] font-bold">6</span>
                What should I do?
              </h4>
              <ul className="mt-2 space-y-1.5 pl-6">
                {alert.whatShouldIDo.map((item, idx) => (
                  <li key={idx} className="text-xs text-emerald-900 flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 7. Confidence / Source */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
              <span className="flex items-center gap-1">
                <Info className="w-3 h-3 text-slate-400" />
                Source: <span className="text-slate-600 font-medium">{alert.confidenceSource}</span>
              </span>
              <span>Issued: {new Date(alert.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

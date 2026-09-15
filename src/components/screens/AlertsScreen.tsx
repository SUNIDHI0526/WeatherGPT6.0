import React, { useState } from 'react';
import { ShieldAlert, Bell, Sparkles, Share2, HelpCircle, AlertTriangle, CheckCircle, Smartphone } from 'lucide-react';
import { AlertData } from '../../types/weather';
import { AlertCard } from '../cards/AlertCard';

interface AlertsScreenProps {
  alerts: AlertData[];
  onAskChatToExplain: (prompt: string) => void;
  onSimulateNotification: (alert: AlertData) => void;
}

export const AlertsScreen: React.FC<AlertsScreenProps> = ({
  alerts,
  onAskChatToExplain,
  onSimulateNotification
}) => {
  const [selectedAlertId, setSelectedAlertId] = useState<string>(alerts[0]?.id || '');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const selectedAlert = alerts.find((a) => a.id === selectedAlertId) || alerts[0];

  const handleShare = (alert: AlertData) => {
    if (navigator.share) {
      navigator.share({
        title: alert.title,
        text: `${alert.title} in ${alert.affectedArea}. Impact: ${alert.whatCouldHappen}`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${alert.title}\n${alert.affectedArea}\nWhen: ${alert.when}\nAction: ${alert.whatShouldIDo.join(', ')}`);
      setCopiedId(alert.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  return (
    <div className="space-y-4 pb-20 max-w-xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-tr from-amber-500/10 via-rose-500/5 to-transparent border border-amber-200 rounded-2xl p-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 font-['Outfit']">
              Explain My Alert
            </h2>
            <p className="text-xs text-slate-600">
              SIH 2026 Core Innovation: Simplifying official & automated alerts for citizens
            </p>
          </div>
        </div>
      </div>

      {/* Alert Selector Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {alerts.map((a) => (
          <button
            key={a.id}
            onClick={() => setSelectedAlertId(a.id)}
            className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-all border ${
              selectedAlertId === a.id
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className="mr-1">{a.hazardType === 'Thunderstorm' ? '⛈️' : '☀️'}</span>
            <span>{a.hazardType}</span>
            <span className={`ml-1.5 text-[9px] px-1.5 py-0.2 rounded ${
              selectedAlertId === a.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {a.severity}
            </span>
          </button>
        ))}
      </div>

      {/* Main Selected Alert Card with 7-point breakdown */}
      {selectedAlert && (
        <div className="space-y-3">
          <AlertCard alert={selectedAlert} initialExpanded={true} />

          {/* Interactive Action Controls */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onAskChatToExplain(`Why did I receive this alert "${selectedAlert.title}" in Nagpur? Explain in simple language.`)}
              className="p-3 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-xl border border-sky-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-sky-600" />
              <span>Ask AI in Hindi / Marathi</span>
            </button>

            <button
              onClick={() => onSimulateNotification(selectedAlert)}
              className="p-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <Smartphone className="w-4 h-4 text-amber-400" />
              <span>Simulate Push Alert</span>
            </button>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => handleShare(selectedAlert)}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedId ? 'Copied advisory to clipboard!' : 'Share safety advisory with family'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Educational info card explaining the feature */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs text-slate-600 space-y-2">
        <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-slate-500" />
          Why "Explain My Alert"?
        </h4>
        <p className="leading-relaxed">
          Standard weather alerts from disaster management portals (CAP / SACHET) often contain heavy meteorological jargon. WeatherGPT deconstructs the warning into human, life-saving answers: exactly where it is hitting in Nagpur, why your phone beeped, and what safety decisions you should take right now.
        </p>
      </div>
    </div>
  );
};

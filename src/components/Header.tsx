import React from 'react';
import { CloudSun, MapPin, Volume2, VolumeX, ShieldAlert, Sparkles } from 'lucide-react';

interface HeaderProps {
  locationName: string;
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenAlerts: () => void;
  hasActiveAlerts?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  locationName,
  isDemoMode,
  onToggleDemoMode,
  soundEnabled,
  onToggleSound,
  onOpenAlerts,
  hasActiveAlerts = true
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] px-4 py-3">
      <div className="max-w-xl mx-auto flex items-center justify-between gap-2">
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 via-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-sky-500/20">
            <CloudSun className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-bold tracking-tight text-slate-900 font-['Outfit']">WeatherGPT</h1>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-md bg-sky-50 text-sky-600 border border-sky-200/60">
                SIH 2026
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Your AI Weather Companion</p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-1.5">
          {/* Audio toggle button */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Speech output enabled' : 'Speech output muted'}
            className={`p-2 rounded-xl border transition-all text-xs font-medium flex items-center gap-1 ${
              soundEnabled
                ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Active Alert button */}
          <button
            onClick={onOpenAlerts}
            title="Explain My Alert"
            className={`relative p-2 rounded-xl border transition-all ${
              hasActiveAlerts
                ? 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100'
                : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            {hasActiveAlerts && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Demo Mode badge/toggle */}
          <button
            onClick={onToggleDemoMode}
            title="Toggle Demo Mode"
            className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition-all flex items-center gap-1 ${
              isDemoMode
                ? 'bg-amber-500/10 text-amber-700 border-amber-300 ring-1 ring-amber-400/20'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isDemoMode ? 'bg-amber-500' : 'bg-emerald-500'}`} />
            {isDemoMode ? 'DEMO MODE' : 'LIVE API'}
          </button>
        </div>
      </div>

      {/* Location Chip */}
      <div className="max-w-xl mx-auto mt-2 pt-1.5 border-t border-slate-50 flex items-center justify-between text-xs text-slate-600">
        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100/80 text-slate-700 font-medium">
          <MapPin className="w-3.5 h-3.5 text-sky-600" />
          <span>📍 {locationName || 'Nagpur District, Maharashtra'}</span>
        </div>
        <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span>Grounded in Open-Meteo & IMD Criteria</span>
        </div>
      </div>
    </header>
  );
};

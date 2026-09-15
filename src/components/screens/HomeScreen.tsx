import React from 'react';
import { Sparkles, MessageSquareQuote, Compass, ShieldAlert, ArrowRight, RefreshCw } from 'lucide-react';
import { WeatherData, LocalRiskIndex, AlertData } from '../../types/weather';
import { WeatherCard } from '../cards/WeatherCard';
import { RiskCard } from '../cards/RiskCard';
import { ForecastCard } from '../cards/ForecastCard';

interface HomeScreenProps {
  weatherData: WeatherData | null;
  riskIndex: LocalRiskIndex | null;
  activeAlert: AlertData | null;
  isLoading: boolean;
  onRefresh: () => void;
  onNavigateToChat: (initialPrompt?: string) => void;
  onNavigateToAlerts: () => void;
  onNavigateToCorridor: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  weatherData,
  riskIndex,
  activeAlert,
  isLoading,
  onRefresh,
  onNavigateToChat,
  onNavigateToAlerts,
  onNavigateToCorridor
}) => {
  const quickPrompts = [
    { label: '🌧️ Will it rain tomorrow?', prompt: 'Will it rain tomorrow in Nagpur?' },
    { label: '☂️ Aaj chata chahiye kya?', prompt: 'Aaj Nagpur mein chata lekar jana chahiye kya?' },
    { label: '🛣️ Nagpur to Kamptee route', prompt: 'Nagpur to Kamptee travel weather risk' },
    { label: '🌾 Shetkari / Farmer advice', prompt: 'Nagpur farmer weather and crop advice' }
  ];

  return (
    <div className="space-y-4 pb-20">
      {/* Active Alert Urgent Banner */}
      {activeAlert && (
        <div
          onClick={onNavigateToAlerts}
          className="cursor-pointer bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-amber-500/5 border border-amber-300/80 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-xs hover:border-amber-400 transition-all"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            <div>
              <p className="text-xs font-bold text-amber-950 flex items-center gap-1">
                <span>{activeAlert.title}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-200/80 text-amber-900 border border-amber-300/80">
                  {activeAlert.isDemo ? 'DEMO DATA' : 'IMD ALERT'}
                </span>
              </p>
              <p className="text-[11px] text-amber-800 line-clamp-1 mt-0.5">
                {activeAlert.headline}
              </p>
            </div>
          </div>
          <div className="flex items-center text-xs font-bold text-amber-900 shrink-0 gap-0.5">
            <span>Explain</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      )}

      {/* Main Weather Card */}
      {weatherData && (
        <WeatherCard
          weather={weatherData.current}
          locationName={weatherData.location.district}
          onAskMore={(p) => onNavigateToChat(p)}
        />
      )}

      {/* Conversational Launchpad Box */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-4 shadow-lg shadow-slate-900/10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-sky-200">
              Ask WeatherGPT Anything
            </h3>
          </div>
          <span className="text-[10px] text-slate-300 font-medium">
            English • हिंदी • Hinglish • मराठी
          </span>
        </div>

        <p className="text-xs text-slate-300 mb-3">
          Conversational AI grounded in verified Open-Meteo telemetry for Nagpur District.
        </p>

        {/* Quick prompt pills */}
        <div className="flex flex-wrap gap-1.5">
          {quickPrompts.map((item, idx) => (
            <button
              key={idx}
              onClick={() => onNavigateToChat(item.prompt)}
              className="text-xs px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-slate-100 font-medium transition-all text-left border border-white/10"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Input box trigger */}
        <button
          onClick={() => onNavigateToChat()}
          className="mt-3 w-full py-2.5 px-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-left text-xs text-slate-300 flex items-center justify-between transition-colors"
        >
          <span>Ask: "Kal Nagpur mein baarish hogi kya?"...</span>
          <MessageSquareQuote className="w-4 h-4 text-sky-400" />
        </button>
      </div>

      {/* Local Risk Index Card */}
      {riskIndex && (
        <RiskCard risk={riskIndex} compact={false} />
      )}

      {/* Hourly / Daily Forecast Section */}
      {weatherData && (
        <ForecastCard
          hourly={weatherData.hourly}
          daily={weatherData.daily}
        />
      )}

      {/* Route Corridor Fast Link */}
      <div
        onClick={onNavigateToCorridor}
        className="cursor-pointer bg-white rounded-2xl border border-sky-100 p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-sky-300 transition-all flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Route Corridor Weather (OSRM)
            </h4>
            <p className="text-xs text-slate-500">
              Nagpur ⇄ Kamptee (NH-44), Hingna MIDC, MIHAN
            </p>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-400" />
      </div>

      {/* Footer attribution */}
      <div className="pt-2 text-center text-[11px] text-slate-400">
        <p>WeatherGPT Prototype • Nagpur District, Maharashtra</p>
        <p className="text-[10px] mt-0.5">SIH 2026 Problem Statement 26068 • WMO WIS2 / Open-Meteo Telemetry</p>
      </div>
    </div>
  );
};

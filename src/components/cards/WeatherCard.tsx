import React from 'react';
import { Thermometer, Droplets, Wind, CloudRain, Cloud, Compass, Sparkles } from 'lucide-react';
import { CurrentWeather } from '../../types/weather';

interface WeatherCardProps {
  weather: CurrentWeather;
  locationName?: string;
  onAskMore?: (prompt: string) => void;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({
  weather,
  locationName = 'Nagpur District',
  onAskMore
}) => {
  return (
    <div className="w-full bg-white rounded-2xl border border-sky-100 shadow-[0_4px_20px_-4px_rgba(56,189,248,0.12)] p-4 text-slate-800 transition-all hover:shadow-[0_6px_24px_-4px_rgba(56,189,248,0.18)]">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nagpur Real-Time</span>
          {weather.isDemo && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              DEMO DATA
            </span>
          )}
        </div>
        <span className="text-[11px] text-slate-400 font-medium">
          {new Date(weather.retrievedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
        </span>
      </div>

      {/* Main Temperature Hero */}
      <div className="flex items-center justify-between gap-4 py-1">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-extrabold tracking-tight text-slate-900 font-['Outfit']">
              {weather.temperature}°
            </span>
            <span className="text-lg font-semibold text-slate-400">C</span>
          </div>
          <p className="text-sm font-semibold text-sky-700 flex items-center gap-1 mt-0.5">
            <span>{weather.conditionIcon}</span>
            <span>{weather.conditionText}</span>
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            Feels like <span className="font-medium text-slate-700">{weather.apparentTemperature}°C</span>
          </p>
        </div>

        {/* Big Icon / Visual badge */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-50 to-indigo-50/60 border border-sky-100 flex items-center justify-center text-3xl shadow-inner">
          {weather.conditionIcon}
        </div>
      </div>

      {/* 4 Key Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-100">
        <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-100/80 flex items-center gap-2">
          <Droplets className="w-4 h-4 text-sky-500 shrink-0" />
          <div>
            <p className="text-[10px] text-slate-400 font-medium leading-none">Humidity</p>
            <p className="text-xs font-bold text-slate-800 mt-1">{weather.relativeHumidity}%</p>
          </div>
        </div>

        <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-100/80 flex items-center gap-2">
          <CloudRain className="w-4 h-4 text-blue-500 shrink-0" />
          <div>
            <p className="text-[10px] text-slate-400 font-medium leading-none">Rain Chance</p>
            <p className="text-xs font-bold text-slate-800 mt-1">{weather.precipitationProbability}%</p>
          </div>
        </div>

        <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-100/80 flex items-center gap-2">
          <Wind className="w-4 h-4 text-teal-500 shrink-0" />
          <div>
            <p className="text-[10px] text-slate-400 font-medium leading-none">Wind Speed</p>
            <p className="text-xs font-bold text-slate-800 mt-1">{weather.windSpeed} km/h</p>
          </div>
        </div>

        <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-100/80 flex items-center gap-2">
          <Cloud className="w-4 h-4 text-indigo-500 shrink-0" />
          <div>
            <p className="text-[10px] text-slate-400 font-medium leading-none">Cloud Cover</p>
            <p className="text-xs font-bold text-slate-800 mt-1">{weather.cloudCover}%</p>
          </div>
        </div>
      </div>

      {/* Quick interactive action chips */}
      {onAskMore && (
        <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-50">
          <button
            onClick={() => onAskMore('Will it rain in the evening?')}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 font-medium transition-colors"
          >
            🌧️ Rain at 6 PM?
          </button>
          <button
            onClick={() => onAskMore('Should I carry an umbrella today?')}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium transition-colors"
          >
            ☂️ Carry umbrella?
          </button>
          <button
            onClick={() => onAskMore('Show hourly forecast for Nagpur')}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium transition-colors"
          >
            📊 Hourly trends
          </button>
        </div>
      )}
    </div>
  );
};

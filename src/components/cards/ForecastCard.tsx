import React from 'react';
import { Clock, Calendar, CloudRain, ArrowUp, ArrowDown } from 'lucide-react';
import { HourlyPoint, DailyPoint } from '../../types/weather';

interface ForecastCardProps {
  hourly?: HourlyPoint[];
  daily?: DailyPoint[];
}

export const ForecastCard: React.FC<ForecastCardProps> = ({ hourly = [], daily = [] }) => {
  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.03)] p-4 text-slate-800">
      {/* Hourly Section */}
      {hourly.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sky-500" />
              <span>Next 12 Hours (Nagpur)</span>
            </h4>
            <span className="text-[11px] text-slate-400">Precipitation %</span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar -mx-1 px-1">
            {hourly.slice(0, 10).map((h, i) => (
              <div
                key={i}
                className="flex flex-col items-center min-w-[62px] bg-slate-50/90 rounded-xl p-2 border border-slate-100/90 text-center shrink-0"
              >
                <span className="text-[11px] font-semibold text-slate-600">{h.time}</span>
                <span className="text-lg my-1">{h.weatherCode >= 50 && h.weatherCode <= 82 ? '🌧️' : (h.weatherCode >= 95 ? '⛈️' : '⛅')}</span>
                <span className="text-xs font-bold text-slate-900">{h.temperature}°</span>

                {/* Rain probability chip */}
                <div className={`mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 ${
                  h.precipitationProbability > 50
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-slate-200/60 text-slate-500'
                }`}>
                  <CloudRain className="w-2.5 h-2.5" />
                  <span>{h.precipitationProbability}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Section */}
      {daily.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              <span>Upcoming Days</span>
            </h4>
          </div>

          <div className="space-y-1.5">
            {daily.slice(0, 4).map((d, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50/60 hover:bg-slate-50 text-xs border border-transparent hover:border-slate-100 transition-colors"
              >
                <div className="w-24">
                  <span className="font-semibold text-slate-800">{d.date}</span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-600 flex-1 justify-center">
                  <span className="text-sm">{d.weatherCode >= 50 ? '🌧️' : '🌤️'}</span>
                  <span className="truncate max-w-[110px] text-slate-600 font-medium">{d.conditionText}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-blue-600 font-semibold flex items-center gap-0.5">
                    <CloudRain className="w-3 h-3" />
                    {d.precipitationProbabilityMax}%
                  </span>
                  <div className="flex items-center gap-1 font-mono font-semibold">
                    <span className="text-slate-900">{d.temperatureMax}°</span>
                    <span className="text-slate-400 font-normal">/</span>
                    <span className="text-slate-500">{d.temperatureMin}°</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

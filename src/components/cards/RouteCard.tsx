import React from 'react';
import { Navigation, Clock, CloudRain, Wind, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { RouteWeather } from '../../types/weather';

interface RouteCardProps {
  route: RouteWeather;
}

export const RouteCard: React.FC<RouteCardProps> = ({ route }) => {
  const riskColor = {
    low: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    moderate: 'text-blue-700 bg-blue-50 border-blue-200',
    high: 'text-amber-700 bg-amber-50 border-amber-200',
    very_high: 'text-rose-700 bg-rose-50 border-rose-200',
  }[route.overallRouteRisk] || 'text-blue-700 bg-blue-50 border-blue-200';

  return (
    <div className="w-full bg-white rounded-2xl border border-sky-100 shadow-[0_4px_16px_rgba(0,0,0,0.04)] p-4 text-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Navigation className="w-4 h-4 text-sky-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Route Corridor Weather (OSRM)
          </h3>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${riskColor}`}>
          Route Risk: {route.overallRouteRisk}
        </span>
      </div>

      {/* Origin -> Destination Banner */}
      <div className="bg-slate-50/90 rounded-xl p-3 border border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase">From</p>
            <p className="text-xs font-bold text-slate-900">{route.fromLocation}</p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 mx-1" />
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase">To</p>
            <p className="text-xs font-bold text-slate-900">{route.toLocation}</p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs font-bold text-slate-900">{route.distanceKm} km</p>
          <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1 justify-end">
            <Clock className="w-3 h-3 text-slate-400" />
            ~{route.durationMinutes} mins
          </p>
        </div>
      </div>

      {/* Corridor Summary & Recommendation */}
      <div className="mt-3 bg-amber-50/50 rounded-xl p-3 border border-amber-200/60">
        <p className="text-xs font-semibold text-amber-900 leading-snug">
          {route.summary}
        </p>
        <p className="text-xs text-amber-800 mt-1 font-medium">
          💡 <span className="font-bold">Recommendation:</span> {route.recommendation}
        </p>
      </div>

      {/* Waypoint Segments Along Route */}
      {route.routeSegments && route.routeSegments.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Weather Along Waypoints:
          </h4>
          <div className="space-y-1.5">
            {route.routeSegments.map((seg, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50/80 border border-slate-100 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-200/70 text-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-800 leading-none">{seg.pointName}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">+{seg.estimatedArrivalMinutes} min mark</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-right">
                  <div className="text-[11px] text-blue-600 font-semibold flex items-center gap-1">
                    <CloudRain className="w-3 h-3" />
                    <span>{seg.rainfallProbability}%</span>
                  </div>
                  <div className="font-semibold text-slate-800">
                    <span>{seg.temperature}°C</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer info */}
      <div className="mt-3 pt-2 text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-100">
        <span>Source: {route.dataSource}</span>
        <span>{route.calculatedAt}</span>
      </div>
    </div>
  );
};

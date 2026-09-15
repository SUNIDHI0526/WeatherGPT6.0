import React, { useState, useEffect, useMemo } from 'react';
import {
  Map as MapIcon,
  Thermometer,
  CloudRain,
  Wind,
  Droplets,
  Layers,
  Sparkles,
  RefreshCw,
  Maximize2,
  Minimize2,
  Info,
  Compass,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { DistrictMapData, StationWeatherPoint } from '../../types/weather';

interface NagpurDistrictWeatherMapProps {
  onAskAboutStation?: (prompt: string) => void;
  onNavigateToCorridor?: () => void;
  compact?: boolean;
}

type MetricMode = 'temp' | 'apparent' | 'rain' | 'humidity';

export const NagpurDistrictWeatherMap: React.FC<NagpurDistrictWeatherMapProps> = ({
  onAskAboutStation,
  onNavigateToCorridor,
  compact = false
}) => {
  const [mapData, setMapData] = useState<DistrictMapData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedStationId, setSelectedStationId] = useState<string>('nagpur-central');
  const [metricMode, setMetricMode] = useState<MetricMode>('temp');
  const [showCorridors, setShowCorridors] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  const fetchMapData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/weather/map');
      const data = await res.json();
      if (data.success && data.mapData) {
        setMapData(data.mapData);
        setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    } catch (err) {
      console.error('[NagpurDistrictWeatherMap] Error loading map telemetry:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMapData();
    const interval = setInterval(fetchMapData, 4 * 60 * 1000); // 4 min live sync
    return () => clearInterval(interval);
  }, []);

  const selectedStation = useMemo(() => {
    if (!mapData || !mapData.stations.length) return null;
    return mapData.stations.find((s) => s.id === selectedStationId) || mapData.stations[0];
  }, [mapData, selectedStationId]);

  // Geographical bounds of Nagpur District for SVG Mercator normalization
  // Latitude: ~20.75°N to ~21.55°N
  // Longitude: ~78.45°E to ~79.45°E
  const BOUNDS = {
    minLat: 20.75,
    maxLat: 21.55,
    minLon: 78.45,
    maxLon: 79.45
  };

  const projectCoords = (lat: number, lon: number) => {
    const x = ((lon - BOUNDS.minLon) / (BOUNDS.maxLon - BOUNDS.minLon)) * 100;
    // Invert Y because SVG coordinates increase downwards
    const y = ((BOUNDS.maxLat - lat) / (BOUNDS.maxLat - BOUNDS.minLat)) * 100;
    return {
      x: Math.min(95, Math.max(5, x)),
      y: Math.min(95, Math.max(5, y))
    };
  };

  // Metric value & color resolver for any station
  const getStationMetric = (station: StationWeatherPoint) => {
    switch (metricMode) {
      case 'temp':
        return {
          display: `${station.temperature}°C`,
          value: station.temperature,
          color: station.colorGrade.hex,
          sub: 'Temperature'
        };
      case 'apparent':
        return {
          display: `${station.apparentTemperature}°C`,
          value: station.apparentTemperature,
          color: station.apparentTemperature > 35 ? '#ea580c' : '#10b981',
          sub: 'Feels like'
        };
      case 'rain':
        return {
          display: `${station.precipitationProbability}%`,
          value: station.precipitationProbability,
          color: station.precipitationProbability > 50 ? '#0284c7' : '#10b981',
          sub: 'Precip Chance'
        };
      case 'humidity':
        return {
          display: `${station.humidity}%`,
          value: station.humidity,
          color: station.humidity > 80 ? '#3b82f6' : '#84cc16',
          sub: 'Rel Humidity'
        };
    }
  };

  // Color gradient legend stops
  const colorLegend = [
    { label: '<18°C', color: '#0284c7', desc: 'Cool' },
    { label: '18–24°C', color: '#059669', desc: 'Pleasant' },
    { label: '24–28°C', color: '#65a30d', desc: 'Moderate' },
    { label: '28–33°C', color: '#d97706', desc: 'Warm' },
    { label: '33–38°C', color: '#ea580c', desc: 'Hot' },
    { label: '38–42°C', color: '#dc2626', desc: 'Very Hot' },
    { label: '>42°C', color: '#991b1b', desc: 'Severe' }
  ];

  return (
    <div
      className={`bg-white rounded-3xl border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-2 sm:inset-6 z-50 overflow-y-auto max-w-5xl mx-auto flex flex-col shadow-2xl ring-1 ring-slate-900/10'
          : 'relative'
      }`}
    >
      {/* Card Header & Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50/90 via-sky-50/40 to-slate-50/90 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-sky-500/20 shrink-0">
            <MapIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight font-['Outfit']">
                Nagpur District Weather Map
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                Live Color Grading
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              Micro-climate isotherms & synoptic stations across Nagpur talukas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          <button
            onClick={fetchMapData}
            disabled={isLoading}
            title="Refresh Live Weather Telemetry"
            className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-sky-600' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Map'}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold flex items-center transition-all active:scale-95"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Metric Mode Filter Tabs & Summary Row */}
      <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
        {/* Mode Selector */}
        <div className="inline-flex p-1 bg-slate-200/60 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setMetricMode('temp')}
            className={`px-3 py-1 rounded-lg transition-all ${
              metricMode === 'temp'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🌡️ Temperature
          </button>
          <button
            onClick={() => setMetricMode('apparent')}
            className={`px-3 py-1 rounded-lg transition-all ${
              metricMode === 'apparent'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🔥 Feels Like
          </button>
          <button
            onClick={() => setMetricMode('rain')}
            className={`px-3 py-1 rounded-lg transition-all ${
              metricMode === 'rain'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🌧️ Rain Risk
          </button>
          <button
            onClick={() => setMetricMode('humidity')}
            className={`hidden sm:inline-block px-3 py-1 rounded-lg transition-all ${
              metricMode === 'humidity'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            💧 Humidity
          </button>
        </div>

        {/* Corridor Overlay Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCorridors(!showCorridors)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1 ${
              showCorridors
                ? 'bg-sky-50 text-sky-700 border-sky-200'
                : 'bg-white text-slate-500 border-slate-200'
            }`}
          >
            <Compass className="w-3 h-3" />
            <span>NH-44 Corridor</span>
          </button>

          {mapData?.temperatureRange && (
            <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
              <span>District Mean: <strong>{mapData.temperatureRange.mean}°C</strong></span>
              <span className="text-slate-300">•</span>
              <span className="text-emerald-700">Min: <strong>{mapData.temperatureRange.min}°C</strong></span>
              <span className="text-slate-300">•</span>
              <span className="text-amber-700">Max: <strong>{mapData.temperatureRange.max}°C</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Color Grading Scale Banner */}
      <div className="px-4 py-2.5 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-300">
            Color Grading:
          </span>
          <span className="text-xs font-semibold text-sky-300">
            {metricMode === 'temp' ? 'Temperature Scale (°C)' : metricMode === 'rain' ? 'Rain Likelihood Scale' : 'Thermal Scale'}
          </span>
        </div>

        {/* Continuous Color Gradient Bar */}
        <div className="w-full sm:w-auto flex items-center gap-1 overflow-x-auto py-0.5 no-scrollbar">
          {colorLegend.map((step, idx) => (
            <div key={idx} className="flex items-center gap-1 shrink-0">
              <span
                className="w-3.5 h-3.5 rounded-md shadow-xs border border-white/20 shrink-0"
                style={{ backgroundColor: step.color }}
              />
              <span className="text-[10px] font-semibold text-slate-200 whitespace-nowrap">
                {step.label}
              </span>
              {idx < colorLegend.length - 1 && (
                <span className="text-[9px] text-slate-500 mx-0.5">›</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Map Visual Stage */}
      <div className="relative w-full bg-[#f8fafc] overflow-hidden min-h-[340px] sm:min-h-[420px] select-none border-b border-slate-100">
        {/* Subtle Map Grid Lines */}
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(#cbd5e1 1px, transparent 1px), radial-gradient(#cbd5e1 1px, #f8fafc 1px)',
            backgroundSize: '40px 40px',
            backgroundPosition: '0 0, 20px 20px'
          }}
        />

        {/* District SVG Map Projection Canvas */}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full preserve-3d"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Ambient District Region Blur filter for Isotherm heatmap */}
            <filter id="isothermBlur" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="8" result="blur" />
            </filter>

            {/* Radial Gradients for Station Micro-climates */}
            {mapData?.stations.map((station) => {
              const pos = projectCoords(station.latitude, station.longitude);
              const metric = getStationMetric(station);
              return (
                <radialGradient
                  key={`grad-${station.id}`}
                  id={`bloom-${station.id}`}
                  cx={`${pos.x}%`}
                  cy={`${pos.y}%`}
                  r="24%"
                  fx={`${pos.x}%`}
                  fy={`${pos.y}%`}
                >
                  <stop offset="0%" stopColor={metric.color} stopOpacity="0.45" />
                  <stop offset="60%" stopColor={metric.color} stopOpacity="0.18" />
                  <stop offset="100%" stopColor={metric.color} stopOpacity="0" />
                </radialGradient>
              );
            })}
          </defs>

          {/* District boundary contour */}
          <path
            d="M 12,25 Q 30,12 60,10 Q 88,12 92,30 Q 95,55 88,80 Q 70,95 45,92 Q 18,88 10,65 Z"
            fill="#f1f5f9"
            stroke="#94a3b8"
            strokeWidth="0.6"
            strokeDasharray="1.5 1.5"
            opacity="0.85"
          />

          {/* Heat blooms behind stations */}
          {mapData?.stations.map((station) => (
            <circle
              key={`heat-${station.id}`}
              cx={projectCoords(station.latitude, station.longitude).x}
              cy={projectCoords(station.latitude, station.longitude).y}
              r="22"
              fill={`url(#bloom-${station.id})`}
              filter="url(#isothermBlur)"
            />
          ))}

          {/* Water Bodies (Khindsi, Ambazari, Koradi) */}
          <path
            d="M 78,25 Q 82,23 85,27 Q 82,30 78,25 Z"
            fill="#38bdf8"
            opacity="0.5"
            stroke="#0284c7"
            strokeWidth="0.4"
          />
          <text x="80" y="24" fontSize="2.2" fill="#0369a1" fontWeight="bold">
            Khindsi
          </text>

          <path
            d="M 48,58 Q 51,56 53,59 Q 50,61 48,58 Z"
            fill="#38bdf8"
            opacity="0.5"
            stroke="#0284c7"
            strokeWidth="0.3"
          />
          <text x="47" y="56" fontSize="2.0" fill="#0369a1" fontWeight="bold">
            Ambazari
          </text>

          {/* Highway Corridors overlay */}
          {showCorridors && (
            <g opacity="0.65">
              {/* NH-44 North-South (Kamptee -> Nagpur -> MIHAN -> South) */}
              <path
                d="M 72,32 L 53,55 L 48,74 L 44,92"
                fill="none"
                stroke="#64748b"
                strokeWidth="1.2"
                strokeDasharray="2 1"
              />
              {/* Amravati-Nagpur-Bhandara (East-West) */}
              <path
                d="M 12,50 L 53,55 L 90,52"
                fill="none"
                stroke="#94a3b8"
                strokeWidth="0.8"
              />
              {/* Outer Ring Road loop */}
              <ellipse
                cx="51"
                cy="58"
                rx="20"
                ry="18"
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="0.7"
                strokeDasharray="1.5 1.5"
              />
              <text x="73" y="34" fontSize="2.0" fill="#475569" fontWeight="bold">
                NH-44
              </text>
            </g>
          )}
        </svg>

        {/* Station Map Marker Pins (DOM elements for crisp text & clickability) */}
        {mapData?.stations.map((station) => {
          const pos = projectCoords(station.latitude, station.longitude);
          const isSelected = station.id === selectedStationId;
          const metric = getStationMetric(station);

          return (
            <div
              key={station.id}
              onClick={() => setSelectedStationId(station.id)}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
              className="absolute z-20 cursor-pointer group"
            >
              {/* Pulsing radar ring */}
              <span
                className="absolute inset-0 rounded-full animate-ping opacity-60 pointer-events-none"
                style={{
                  backgroundColor: metric.color,
                  animationDuration: isSelected ? '1.4s' : '3s'
                }}
              />

              {/* Station Marker Pill */}
              <div
                className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all shadow-md active:scale-95 ${
                  isSelected
                    ? 'ring-3 ring-slate-900 scale-110 z-30 bg-slate-900 text-white'
                    : 'bg-white/95 text-slate-800 hover:scale-105 hover:bg-white border border-slate-200/90'
                }`}
              >
                {/* Weather condition icon */}
                <span className="text-xs">{station.conditionIcon}</span>

                {/* Station Name & Live Value */}
                <span className={`text-[11px] truncate max-w-[85px] sm:max-w-[120px] ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                  {station.name.split('(')[0].trim()}
                </span>

                {/* Color-graded metric badge */}
                <span
                  className="px-1.5 py-0.2 rounded-md text-[10px] font-extrabold text-white shadow-2xs"
                  style={{ backgroundColor: metric.color }}
                >
                  {metric.display}
                </span>
              </div>
            </div>
          );
        })}

        {/* Map Legend Overlay in bottom-left corner */}
        <div className="absolute bottom-3 left-3 z-10 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-xs text-[11px] text-slate-600 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Tap any station for local micro-climate forecast</span>
        </div>

        {/* Provider Tag in bottom-right corner */}
        <div className="absolute bottom-3 right-3 z-10 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-semibold text-slate-200 shadow-xs">
          Open-Meteo Synoptic Grid • {lastRefreshed || 'Live'}
        </div>
      </div>

      {/* Selected Station Deep-Dive Inspector Panel */}
      {selectedStation && (
        <div className="p-4 sm:p-5 bg-gradient-to-br from-slate-50 via-white to-sky-50/30">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            {/* Left: Station Identity & Big Temperature */}
            <div className="flex items-center gap-3.5">
              <div
                className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center text-white shadow-md shrink-0"
                style={{ backgroundColor: selectedStation.colorGrade.hex }}
              >
                <span className="text-lg">{selectedStation.conditionIcon}</span>
                <span className="text-xs font-black tracking-tight">{selectedStation.temperature}°C</span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-slate-900 font-['Outfit']">
                    {selectedStation.name}
                  </h4>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: selectedStation.colorGrade.hex }}
                  >
                    {selectedStation.colorGrade.label}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Zone: {selectedStation.zone} • {selectedStation.conditionText}
                </p>
              </div>
            </div>

            {/* Middle: Key Meteorological Stats */}
            <div className="grid grid-cols-3 gap-2 w-full md:w-auto">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 text-center">
                <span className="text-[10px] font-semibold text-slate-400 block">Feels Like</span>
                <span className="text-xs font-bold text-slate-800">
                  {selectedStation.apparentTemperature}°C
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 text-center">
                <span className="text-[10px] font-semibold text-slate-400 block">Humidity</span>
                <span className="text-xs font-bold text-sky-700">
                  {selectedStation.humidity}%
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 text-center">
                <span className="text-[10px] font-semibold text-slate-400 block">Wind Speed</span>
                <span className="text-xs font-bold text-slate-800">
                  {selectedStation.windSpeed} km/h
                </span>
              </div>
            </div>

            {/* Right: Conversational AI Prompt Action */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              {onAskAboutStation && (
                <button
                  onClick={() =>
                    onAskAboutStation(
                      `What is the current weather and rainfall forecast for ${selectedStation.name} in Nagpur?`
                    )
                  }
                  className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-sky-500/20 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-sky-200" />
                  <span>Ask AI About This Area</span>
                </button>
              )}

              {onNavigateToCorridor && (
                <button
                  onClick={onNavigateToCorridor}
                  title="View Route Corridor"
                  className="px-3 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-all"
                >
                  <Compass className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Corridor</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Taluka Stations Horizontal Selector Pill Bar */}
          <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <span className="text-[11px] font-bold text-slate-400 shrink-0 mr-1">
              Select Taluka:
            </span>
            {mapData?.stations.map((s) => {
              const active = s.id === selectedStationId;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedStationId(s.id)}
                  className={`text-xs px-2.5 py-1 rounded-xl font-medium shrink-0 flex items-center gap-1.5 transition-all ${
                    active
                      ? 'bg-slate-900 text-white shadow-xs font-bold'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: s.colorGrade.hex }}
                  />
                  <span>{s.name.split('(')[0].trim()}</span>
                  <span className="text-[10px] opacity-75 font-bold">{s.temperature}°</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

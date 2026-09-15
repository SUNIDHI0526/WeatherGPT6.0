import React, { useState } from 'react';
import { Compass, Navigation, MapPin, Clock, CloudRain, AlertTriangle, ArrowRight, RefreshCw, Car, Map as MapIcon } from 'lucide-react';
import { RouteWeather } from '../../types/weather';
import { RouteCard } from '../cards/RouteCard';
import { NagpurDistrictWeatherMap } from '../cards/NagpurDistrictWeatherMap';

interface LocationsScreenProps {
  onComputeRoute: (from: string, to: string) => Promise<RouteWeather>;
  onAskChatAboutRoute: (from: string, to: string) => void;
}

export const LocationsScreen: React.FC<LocationsScreenProps> = ({
  onComputeRoute,
  onAskChatAboutRoute
}) => {
  const [activeTab, setActiveTab] = useState<'map' | 'corridor'>('map');
  const [fromLoc, setFromLoc] = useState('nagpur');
  const [toLoc, setToLoc] = useState('kamptee');
  const [isLoading, setIsLoading] = useState(false);
  const [routeResult, setRouteResult] = useState<RouteWeather | null>(null);

  const nagpurSubLocations = [
    { id: 'nagpur', name: 'Nagpur Central (Zero Mile)', lat: 21.1458, lon: 79.0882, zone: 'Urban Core' },
    { id: 'kamptee', name: 'Kamptee (NH-44 North)', lat: 21.2230, lon: 79.1983, zone: 'Sub-District / Military Area' },
    { id: 'hingna', name: 'Hingna MIDC', lat: 21.0667, lon: 78.9667, zone: 'Industrial Corridor' },
    { id: 'mihan', name: 'MIHAN / Wardha Road', lat: 21.0500, lon: 79.0500, zone: 'SEZ & Metro Corridor' },
    { id: 'ramtek', name: 'Ramtek Hills & Dam', lat: 21.3967, lon: 79.3333, zone: 'North Agricultural Zone' }
  ];

  const handleCalculate = async () => {
    setIsLoading(true);
    try {
      const res = await onComputeRoute(fromLoc, toLoc);
      setRouteResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 pb-20 max-w-xl mx-auto">
      {/* Top Segmented Navigation Tab */}
      <div className="flex bg-slate-200/70 p-1 rounded-2xl border border-slate-200/80">
        <button
          onClick={() => setActiveTab('map')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'map'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MapIcon className="w-4 h-4 text-sky-600" />
          <span>District Weather Map</span>
        </button>
        <button
          onClick={() => setActiveTab('corridor')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'corridor'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Car className="w-4 h-4 text-indigo-600" />
          <span>Route Corridor Transit</span>
        </button>
      </div>

      {activeTab === 'map' ? (
        <div className="space-y-4">
          <NagpurDistrictWeatherMap
            onAskAboutStation={(prompt) => onAskChatAboutRoute('Nagpur', prompt)}
            onNavigateToCorridor={() => setActiveTab('corridor')}
          />

          {/* Nagpur Sub-District Locations Guide */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-500" />
              <span>Covered Synoptic Stations in Nagpur District</span>
            </h3>
            <div className="space-y-2">
              {nagpurSubLocations.map((loc) => (
                <div
                  key={loc.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-900">{loc.name}</p>
                    <p className="text-[10px] text-slate-400">
                      {loc.zone} • {loc.lat.toFixed(4)}°N, {loc.lon.toFixed(4)}°E
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                    Live Telemetry
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Header */}
          <div className="bg-sky-50/70 border border-sky-100 rounded-2xl p-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 font-['Outfit']">
                  Nagpur Route Corridor Weather
                </h2>
                <p className="text-xs text-slate-600">
                  Real-time route weather intelligence powered by OSRM + Open-Meteo
                </p>
              </div>
            </div>
          </div>

      {/* Corridor Route Calculator Form */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_4px_16px_rgba(0,0,0,0.03)] p-4 space-y-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Car className="w-4 h-4 text-sky-600" />
          <span>Plan Transit Along Weather Corridors</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">
              From (Origin)
            </label>
            <select
              value={fromLoc}
              onChange={(e) => setFromLoc(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-sky-500"
            >
              {nagpurSubLocations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">
              To (Destination)
            </label>
            <select
              value={toLoc}
              onChange={(e) => setToLoc(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-sky-500"
            >
              {nagpurSubLocations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Calculate button */}
        <button
          onClick={handleCalculate}
          disabled={isLoading}
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Querying OSRM & Open-Meteo Waypoints...</span>
            </>
          ) : (
            <>
              <Navigation className="w-4 h-4" />
              <span>Calculate Corridor Weather & Risk</span>
            </>
          )}
        </button>
      </div>

      {/* Result Card */}
      {routeResult && (
        <div className="space-y-3">
          <RouteCard route={routeResult} />

          <button
            onClick={() => onAskChatAboutRoute(routeResult.fromLocation, routeResult.toLocation)}
            className="w-full py-2.5 px-3 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-xl border border-sky-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Ask WeatherGPT detailed commute advice for this route</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Nagpur Sub-District Locations Guide */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-slate-500" />
          <span>Covered Zones in Nagpur District Prototype</span>
        </h3>
        <div className="space-y-2">
          {nagpurSubLocations.map((loc) => (
            <div
              key={loc.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
            >
              <div>
                <p className="font-bold text-slate-900">{loc.name}</p>
                <p className="text-[10px] text-slate-400">{loc.zone} • {loc.lat.toFixed(4)}°N, {loc.lon.toFixed(4)}°E</p>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                Active Telemetry
              </span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-slate-400 mt-3 italic">
          Designed with modular adapter patterns so other Maharashtra districts (e.g. Wardha, Amravati, Chandrapur) can be plugged in later.
        </p>
      </div>
    </div>
  )}
</div>
);
};

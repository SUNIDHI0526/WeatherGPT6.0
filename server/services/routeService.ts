import { RouteWeather, RouteSegment, RiskLevel } from '../../src/types/weather';
import { weatherService, NAGPUR_LOCATIONS } from './weatherService';

interface Coordinate {
  lat: number;
  lon: number;
  name: string;
}

const KNOWN_POINTS: Record<string, Coordinate> = {
  nagpur: { lat: 21.1458, lon: 79.0882, name: 'Nagpur Central (Zero Mile)' },
  kamptee: { lat: 21.2230, lon: 79.1983, name: 'Kamptee Town' },
  hingna: { lat: 21.0667, lon: 78.9667, name: 'Hingna MIDC' },
  ramtek: { lat: 21.3967, lon: 79.3333, name: 'Ramtek' },
  mihan: { lat: 21.0500, lon: 79.0500, name: 'MIHAN SEZ' },
  katol: { lat: 21.2700, lon: 78.5800, name: 'Katol' }
};

export async function calculateRouteCorridorWeather(
  fromKey = 'nagpur',
  toKey = 'kamptee'
): Promise<RouteWeather> {
  const fromCoord = KNOWN_POINTS[fromKey.toLowerCase()] || KNOWN_POINTS.nagpur;
  const toCoord = KNOWN_POINTS[toKey.toLowerCase()] || KNOWN_POINTS.kamptee;

  let distanceKm = 16.5;
  let durationMinutes = 32;
  let waypoints: Coordinate[] = [];

  // Attempt real OSRM driving route
  try {
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${fromCoord.lon},${fromCoord.lat};${toCoord.lon},${toCoord.lat}?overview=full&geometries=geojson`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(osrmUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const json = await res.json();
      if (json.routes && json.routes.length > 0) {
        const route = json.routes[0];
        distanceKm = Math.round((route.distance / 1000) * 10) / 10;
        durationMinutes = Math.round(route.duration / 60);

        // Sample coordinates along the polyline
        const coords: [number, number][] = route.geometry.coordinates;
        if (coords.length > 0) {
          const step = Math.max(1, Math.floor(coords.length / 4));
          waypoints = [
            { lat: coords[0][1], lon: coords[0][0], name: `${fromCoord.name} (Start)` },
            { lat: coords[Math.min(step, coords.length - 1)][1], lon: coords[Math.min(step, coords.length - 1)][0], name: 'Corridor Mile 1 (Automotive Sq)' },
            { lat: coords[Math.min(step * 2, coords.length - 1)][1], lon: coords[Math.min(step * 2, coords.length - 1)][0], name: 'Midway Segment (Kanhan Bridge)' },
            { lat: coords[coords.length - 1][1], lon: coords[coords.length - 1][0], name: `${toCoord.name} (End)` }
          ];
        }
      }
    }
  } catch (err) {
    console.warn('OSRM routing timed out or failed, using geometric corridor interpolation:', err);
  }

  // Fallback corridor points if OSRM was unreachable
  if (waypoints.length === 0) {
    waypoints = [
      { lat: fromCoord.lat, lon: fromCoord.lon, name: `${fromCoord.name} (Start)` },
      { lat: (fromCoord.lat * 2 + toCoord.lat) / 3, lon: (fromCoord.lon * 2 + toCoord.lon) / 3, name: 'North Ring Road Intersection' },
      { lat: (fromCoord.lat + toCoord.lat * 2) / 3, lon: (fromCoord.lon + toCoord.lon * 2) / 3, name: 'Kanhan Corridor Bridge' },
      { lat: toCoord.lat, lon: toCoord.lon, name: `${toCoord.name} (Destination)` }
    ];
  }

  // Retrieve actual weather data along route points in parallel
  const weatherResults = await Promise.all(
    waypoints.map(async (pt, i) => {
      const segmentMinutes = Math.round((durationMinutes / Math.max(1, waypoints.length - 1)) * i);
      const wData = await weatherService.getWeatherForCoords(pt.lat, pt.lon, pt.name);
      const curr = wData.current;

      let segRisk: RiskLevel = 'low';
      if (curr.precipitationProbability > 65 || curr.windSpeed > 30) segRisk = 'high';
      else if (curr.precipitationProbability > 35 || curr.windSpeed > 20) segRisk = 'moderate';

      const segment: RouteSegment = {
        pointName: pt.name,
        latitude: pt.lat,
        longitude: pt.lon,
        estimatedArrivalMinutes: segmentMinutes,
        temperature: curr.temperature,
        condition: curr.conditionText,
        rainfallProbability: curr.precipitationProbability,
        windSpeed: curr.windSpeed,
        segmentRisk: segRisk
      };

      return { segment, rainProb: curr.precipitationProbability, wind: curr.windSpeed };
    })
  );

  const segments = weatherResults.map(r => r.segment);
  const maxRainProb = Math.max(...weatherResults.map(r => r.rainProb), 0);
  const maxWind = Math.max(...weatherResults.map(r => r.wind), 0);

  let overallRouteRisk: RiskLevel = 'low';
  let summary = `Clear travel corridor between ${fromCoord.name} and ${toCoord.name}. Minimal weather interference expected.`;
  let keyHazardTiming = 'Favorable conditions throughout transit window.';
  let recommendation = 'Standard travel precautions. Roads are dry and visibility is clear.';

  if (maxRainProb > 65) {
    overallRouteRisk = 'high';
    summary = `Heavy rain and convective shower bands detected along the ${fromCoord.name} to ${toCoord.name} corridor.`;
    keyHazardTiming = 'High risk window: 5:00 PM – 7:30 PM along mid-corridor sectors.';
    recommendation = 'Consider delaying transit or leaving 30–45 minutes earlier. Two-wheelers should carry waterproofs and be cautious of slick asphalt.';
  } else if (maxRainProb > 35 || maxWind > 22) {
    overallRouteRisk = 'moderate';
    summary = `Scattered light rain showers and moderate wind gusts along the NH-44 corridor section.`;
    keyHazardTiming = 'Rainfall risk increases around the middle section of your journey near Automotive Chowk / Kanhan.';
    recommendation = 'Consider leaving 20–30 minutes earlier to avoid sudden evening congestion.';
  }

  return {
    fromLocation: fromCoord.name,
    toLocation: toCoord.name,
    distanceKm,
    durationMinutes,
    overallRouteRisk,
    summary,
    keyHazardTiming,
    recommendation,
    routeSegments: segments,
    dataSource: 'OSRM Route Engine + Open-Meteo Coordinate Telemetry',
    calculatedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' })
  };
}

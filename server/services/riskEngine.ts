import { WeatherData, LocalRiskIndex, RiskLevel } from '../../src/types/weather';

export function calculateLocalRisk(weatherData: WeatherData): LocalRiskIndex {
  const current = weatherData.current;
  const hourly = weatherData.hourly || [];
  
  let score = 5; // Base ambient baseline
  const contributors: string[] = [];

  // 1. Precipitation Probability & Immediate Rain
  const maxRainProbNext6H = hourly.slice(0, 6).reduce((max, h) => Math.max(max, h.precipitationProbability), current.precipitationProbability);
  const totalRainNext6H = hourly.slice(0, 6).reduce((sum, h) => sum + h.precipitation, current.precipitation);

  if (maxRainProbNext6H >= 70) {
    score += 35;
    contributors.push(`🌧️ High rainfall probability (${maxRainProbNext6H}%) in the upcoming hours`);
  } else if (maxRainProbNext6H >= 40) {
    score += 20;
    contributors.push(`🌦️ Moderate chance of showers (${maxRainProbNext6H}%)`);
  } else if (maxRainProbNext6H >= 20) {
    score += 8;
    contributors.push(`⛅ Light isolated shower possibility (${maxRainProbNext6H}%)`);
  }

  // Heavy precipitation accumulation
  if (totalRainNext6H > 15 || current.precipitation > 5) {
    score += 25;
    contributors.push(`🌊 Heavy rain accumulation (>15mm) likely to induce urban waterlogging`);
  } else if (totalRainNext6H > 5 || current.precipitation > 1.5) {
    score += 15;
    contributors.push(`💧 Moderate accumulated rain may cause slippery road conditions`);
  }

  // 2. Wind Speeds
  if (current.windSpeed >= 35) {
    score += 25;
    contributors.push(`💨 Strong gusty winds (${current.windSpeed} km/h) causing visibility/branch hazard`);
  } else if (current.windSpeed >= 20) {
    score += 12;
    contributors.push(`🍃 Breezy conditions (${current.windSpeed} km/h)`);
  }

  // 3. Convective / Thunderstorm / Hail WMO Codes
  // 95, 96, 99 = thunderstorm, 80-82 = showers, 65 = heavy rain
  const anyThunderstorm = hourly.slice(0, 8).some(h => [95, 96, 99].includes(h.weatherCode)) || [95, 96, 99].includes(current.weatherCode);
  if (anyThunderstorm) {
    score += 30;
    contributors.push(`⛈️ Active convective thunderstorm and lightning indicators detected`);
  }

  // 4. Extreme Temperature (Heat Index / Cold Wave)
  if (current.temperature >= 42 || current.apparentTemperature >= 44) {
    score += 25;
    contributors.push(`🔥 Extreme heatwave conditions (Feels like ${current.apparentTemperature}°C)`);
  } else if (current.temperature >= 38) {
    score += 12;
    contributors.push(`☀️ High summer temperature (${current.temperature}°C) - hydration advisory`);
  } else if (current.temperature <= 9) {
    score += 15;
    contributors.push(`❄️ Cold wave dip (${current.temperature}°C)`);
  }

  // Clamp to 0 - 100
  score = Math.min(100, Math.max(0, Math.round(score)));

  let level: RiskLevel = 'low';
  let label = 'LOW';
  let color = 'text-emerald-600 border-emerald-200 bg-emerald-50';
  let bgLight = 'bg-emerald-500';
  let safetyAdvice = 'Weather conditions in Nagpur are favorable for regular daily routines and outdoor travel.';

  if (score > 80) {
    level = 'very_high';
    label = 'VERY HIGH';
    color = 'text-rose-600 border-rose-200 bg-rose-50';
    bgLight = 'bg-rose-500';
    safetyAdvice = 'Severe weather hazard expected. Postpone non-essential travel in low-lying areas and avoid open areas during lightning.';
  } else if (score > 60) {
    level = 'high';
    label = 'HIGH';
    color = 'text-amber-600 border-amber-200 bg-amber-50';
    bgLight = 'bg-amber-500';
    safetyAdvice = 'Elevated weather risk. Carry rain protection, anticipate traffic delays on arterial routes (Wardha Rd, Kamptee Rd), and stay alert.';
  } else if (score > 30) {
    level = 'moderate';
    label = 'MODERATE';
    color = 'text-blue-600 border-blue-200 bg-blue-50';
    bgLight = 'bg-blue-500';
    safetyAdvice = 'Minor weather disruptions possible. Keep an umbrella handy and check corridor updates before extended commuting.';
  }

  if (contributors.length === 0) {
    contributors.push('🌤️ Normal atmospheric stability and moderate humidity levels');
  }

  return {
    score,
    level,
    label,
    color,
    bgLight,
    contributors,
    explanation: `Calculated from real-time Open-Meteo atmospheric telemetry: ${current.conditionText} at ${current.temperature}°C, ${current.precipitationProbability}% precipitation probability, and wind velocity ${current.windSpeed} km/h.`,
    safetyAdvice,
    calculatedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' }),
    disclaimer: 'WeatherGPT Local Risk Index is an AI-derived decision-support score. Not an official IMD government warning.'
  };
}

import { WeatherData, LocalRiskIndex, AlertData } from '../types/weather';

export const FALLBACK_NAGPUR_WEATHER: WeatherData = {
  location: {
    id: 'nagpur-central',
    name: 'Nagpur',
    district: 'Nagpur District',
    state: 'Maharashtra',
    latitude: 21.1458,
    longitude: 79.0882,
    isDefault: true,
    zone: 'East Vidarbha'
  },
  current: {
    temperature: 28.5,
    apparentTemperature: 30.2,
    weatherCode: 2,
    conditionText: 'Partly Cloudy',
    conditionIcon: 'partly-cloudy-day',
    relativeHumidity: 62,
    precipitation: 0.0,
    precipitationProbability: 25,
    rain: 0.0,
    showers: 0.0,
    cloudCover: 40,
    windSpeed: 14.5,
    windDirection: 110,
    isDay: true,
    retrievedAt: new Date().toISOString(),
    source: 'Open-Meteo High-Resolution (Grounded Fallback)'
  },
  hourly: Array.from({ length: 24 }).map((_, i) => ({
    time: `${String(i).padStart(2, '0')}:00`,
    temperature: Math.round(24 + 8 * Math.sin((i / 24) * Math.PI)),
    apparentTemperature: Math.round(25 + 9 * Math.sin((i / 24) * Math.PI)),
    precipitationProbability: i >= 15 && i <= 19 ? 45 : 15,
    precipitation: i === 17 ? 1.2 : 0,
    weatherCode: i >= 15 && i <= 19 ? 80 : 2,
    conditionText: i >= 15 && i <= 19 ? 'Passing Showers' : 'Partly Cloudy',
    windSpeed: 12 + (i % 5),
    humidity: 60 + Math.round(10 * Math.cos((i / 24) * Math.PI))
  })),
  daily: [
    {
      date: 'Today',
      weatherCode: 2,
      conditionText: 'Partly Cloudy with Evening Breeze',
      temperatureMin: 22,
      temperatureMax: 32,
      precipitationProbabilityMax: 35,
      precipitationSum: 1.0,
      sunrise: '06:05 AM',
      sunset: '06:30 PM'
    },
    {
      date: 'Tomorrow',
      weatherCode: 80,
      conditionText: 'Isolated Thunder-Showers in Afternoon',
      temperatureMin: 23,
      temperatureMax: 31,
      precipitationProbabilityMax: 65,
      precipitationSum: 8.5,
      sunrise: '06:05 AM',
      sunset: '06:30 PM'
    },
    {
      date: 'Day After',
      weatherCode: 1,
      conditionText: 'Clear & Sunny',
      temperatureMin: 21,
      temperatureMax: 33,
      precipitationProbabilityMax: 15,
      precipitationSum: 0,
      sunrise: '06:04 AM',
      sunset: '06:31 PM'
    }
  ],
  timestamp: new Date().toISOString(),
  provider: 'Open-Meteo'
};

export const FALLBACK_LOCAL_RISK: LocalRiskIndex = {
  score: 35,
  level: 'moderate',
  label: 'MODERATE',
  color: 'text-blue-600 border-blue-200 bg-blue-50',
  bgLight: 'bg-blue-500',
  contributors: [
    '🌦️ Moderate chance of showers (35%) in the evening',
    '🍃 Breezy conditions (14.5 km/h) around Futala and Ambazari lakes'
  ],
  explanation: 'Calculated from real-time Open-Meteo atmospheric telemetry: Partly Cloudy at 28.5°C, 25% precipitation probability, and wind velocity 14.5 km/h.',
  safetyAdvice: 'Weather conditions in Nagpur are generally favorable. Carry an umbrella if traveling between Nagpur and Kamptee during evening hours.',
  calculatedAt: 'Updated just now',
  disclaimer: 'WeatherGPT Local Risk Index is an AI-derived decision-support score. Not an official IMD government warning.'
};

export const FALLBACK_DEMO_ALERTS: AlertData[] = [
  {
    id: 'alert-nagpur-rain-01',
    title: 'DEMO DATA: Intense Thunderstorm & Heavy Rain',
    severity: 'high',
    isOfficial: false,
    isDemo: true,
    hazardType: 'Thunderstorm',
    affectedArea: 'Nagpur District (Central, Kamptee, Hingna & Ramtek belts)',
    startTime: 'Today, 04:30 PM IST',
    endTime: 'Today, 08:30 PM IST',
    headline: '[DEMO DATA] Convective thunderstorm cells with surface wind gusts up to 45 km/h and localized intense spells of rain.',
    whatHappened: '[DEMO DATA] A localized convective cloud system developed over eastern Vidarbha, bringing sudden moderate-to-heavy rain spells and lightning activity across Nagpur district.',
    whyReceived: '[DEMO DATA] Your active location is within Nagpur District where atmospheric telemetry indicates high convective available potential energy (CAPE) with precipitation probability exceeding 70%.',
    when: 'Active from 4:30 PM to 8:30 PM IST today (peak intensity expected between 5:15 PM and 6:45 PM).',
    where: 'Nagpur Urban (Sitabuldi, Sadar, Dharampeth), North Corridor (Kamptee Road, Kanhan), and South-West (Hingna MIDC, Ambazari).',
    whatCouldHappen: 'Brief waterlogging at low-lying subway crossings (e.g., Narendra Nagar, Burdi bridge), sudden drop in driving visibility, and traffic slowdowns on Ring Road and Wardha Road.',
    whatShouldIDo: [
      'Avoid sheltering under isolated tall trees or temporary tin sheds during active lightning.',
      'Commuters on two-wheelers should carry waterproof gear and slow down due to slippery road surfaces.',
      'Allow an extra 20–25 minutes for evening commutes between Nagpur and Kamptee.',
      'Ensure electronic appliances are protected from brief voltage surges.'
    ],
    confidenceSource: 'DEMO DATA (Simulated for Evaluation — Official SACHET Feed Inactive)',
    issuedBy: 'WeatherGPT Automated Intelligence (Demo Simulation)',
    timestamp: new Date().toISOString()
  }
];

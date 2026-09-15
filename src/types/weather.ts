export type LanguageCode = 'en' | 'hi' | 'hinglish' | 'mr' | 'mr-latin';

export type UserProfileType = 
  | 'student' 
  | 'commuter' 
  | 'farmer' 
  | 'worker' 
  | 'traveller' 
  | 'event' 
  | 'general';

export interface LocationInfo {
  id: string;
  name: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  isDefault?: boolean;
  zone?: string;
}

export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  weatherCode: number;
  conditionText: string;
  conditionIcon: string;
  relativeHumidity: number;
  precipitation: number;
  precipitationProbability: number;
  rain: number;
  showers: number;
  cloudCover: number;
  windSpeed: number;
  windDirection: number;
  isDay: boolean;
  retrievedAt: string;
  source: string;
  isDemo?: boolean;
}

export interface HourlyPoint {
  time: string; // ISO or "HH:MM"
  temperature: number;
  apparentTemperature?: number;
  precipitationProbability: number;
  precipitation: number;
  weatherCode: number;
  conditionText: string;
  windSpeed: number;
  humidity: number;
}

export interface DailyPoint {
  date: string;
  temperatureMax: number;
  temperatureMin: number;
  precipitationProbabilityMax: number;
  precipitationSum: number;
  weatherCode: number;
  conditionText: string;
  sunrise: string;
  sunset: string;
}

export interface WeatherData {
  location: LocationInfo;
  current: CurrentWeather;
  hourly: HourlyPoint[];
  daily: DailyPoint[];
  timestamp: string;
  provider: 'Open-Meteo' | 'RapidAPI' | 'WIS2' | 'Demo Provider';
  isFallback?: boolean;
}

export interface StationWeatherPoint {
  id: string;
  name: string;
  zone: string;
  latitude: number;
  longitude: number;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  precipitationProbability: number;
  conditionText: string;
  weatherCode: number;
  conditionIcon: string;
  riskScore: number;
  riskLevel: RiskLevel;
  colorGrade: {
    hex: string;
    bgClass: string;
    textClass: string;
    label: string;
  };
}

export interface DistrictMapData {
  district: string;
  state: string;
  updatedAt: string;
  provider: string;
  stations: StationWeatherPoint[];
  temperatureRange: {
    min: number;
    max: number;
    mean: number;
  };
  warmestStation: string;
  coolestStation: string;
}

export type RiskLevel = 'low' | 'moderate' | 'high' | 'very_high';

export interface LocalRiskIndex {
  score: number; // 0 - 100
  level: RiskLevel;
  label: string; // e.g. "LOW", "MODERATE", "HIGH", "VERY HIGH"
  color: string; // Tailwind color class or hex
  bgLight: string;
  contributors: string[];
  explanation: string;
  safetyAdvice: string;
  calculatedAt: string;
  disclaimer: string;
}

export type AlertSeverity = 'info' | 'moderate' | 'high' | 'severe';

export interface AlertData {
  id: string;
  title: string;
  severity: AlertSeverity;
  isOfficial: boolean; // false if demo
  isDemo: boolean;
  hazardType: 'Rain' | 'Thunderstorm' | 'Heatwave' | 'Wind' | 'Fog' | 'General';
  affectedArea: string;
  startTime: string;
  endTime: string;
  headline: string;
  
  // Explain My Alert Innovation parameters
  whatHappened: string;
  whyReceived: string;
  when: string;
  where: string;
  whatCouldHappen: string;
  whatShouldIDo: string[];
  confidenceSource: string;
  issuedBy: string;
  timestamp: string;
}

export interface RouteSegment {
  pointName: string;
  latitude: number;
  longitude: number;
  estimatedArrivalMinutes: number;
  temperature: number;
  condition: string;
  rainfallProbability: number;
  windSpeed: number;
  segmentRisk: RiskLevel;
}

export interface RouteWeather {
  fromLocation: string;
  toLocation: string;
  distanceKm: number;
  durationMinutes: number;
  overallRouteRisk: RiskLevel;
  summary: string;
  keyHazardTiming: string;
  recommendation: string;
  routeSegments: RouteSegment[];
  dataSource: string;
  calculatedAt: string;
}

export interface PersonalAdvice {
  profile: UserProfileType;
  title: string;
  summary: string;
  precautions: string[];
  safeWindows: string[];
  riskFactor: 'Low' | 'Medium' | 'High';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'bot' | 'system';
  text: string;
  timestamp: string;
  detectedLanguage?: LanguageCode;
  cards?: {
    weather?: CurrentWeather;
    forecast?: HourlyPoint[];
    alert?: AlertData;
    risk?: LocalRiskIndex;
    route?: RouteWeather;
    advice?: PersonalAdvice;
  };
  sources?: string[];
  isVoice?: boolean;
}

export interface SimulatedNotification {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'risk_spike' | 'rain_forecast' | 'corridor';
  timestamp: string;
  read: boolean;
}

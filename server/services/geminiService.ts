import { GoogleGenAI } from '@google/genai';
import { WeatherData, AlertData, LocalRiskIndex, RouteWeather, PersonalAdvice, UserProfileType } from '../../src/types/weather';
import { ParsedQuery } from './languageService';

export interface GroundedContext {
  parsedQuery: ParsedQuery;
  weatherData: WeatherData;
  riskIndex: LocalRiskIndex;
  activeAlert?: AlertData | null;
  routeWeather?: RouteWeather | null;
  userProfile?: UserProfileType;
}

export interface ChatResponsePayload {
  text: string;
  detectedLanguage: string;
  sources: string[];
  cards: {
    weather?: WeatherData['current'];
    forecast?: WeatherData['hourly'];
    alert?: AlertData;
    risk?: LocalRiskIndex;
    route?: RouteWeather;
    advice?: PersonalAdvice;
  };
}

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

export async function generateGroundedResponse(context: GroundedContext): Promise<ChatResponsePayload> {
  const { parsedQuery, weatherData, riskIndex, activeAlert, routeWeather, userProfile = 'general' } = context;
  const current = weatherData.current;
  const tomorrowForecast = weatherData.daily?.[1];

  const cards: ChatResponsePayload['cards'] = {};
  const sources = [weatherData.current.source];

  // Attach appropriate cards based on query intent
  if (parsedQuery.intent === 'current_weather' || parsedQuery.intent === 'general_weather') {
    cards.weather = current;
    cards.risk = riskIndex;
  } else if (parsedQuery.intent === 'rain_forecast' || parsedQuery.intent === 'future_forecast') {
    cards.weather = current;
    cards.forecast = weatherData.hourly?.slice(0, 8);
    cards.risk = riskIndex;
  } else if (parsedQuery.intent === 'explain_alert' && activeAlert) {
    cards.alert = activeAlert;
    sources.push(activeAlert.confidenceSource);
  } else if (parsedQuery.intent === 'route_travel' && routeWeather) {
    cards.route = routeWeather;
    sources.push(routeWeather.dataSource);
  } else if (parsedQuery.intent === 'risk_check') {
    cards.risk = riskIndex;
  } else if (parsedQuery.intent === 'profile_advice') {
    cards.weather = current;
    cards.risk = riskIndex;
    cards.advice = generateProfileAdvice(userProfile, current, riskIndex);
  } else {
    cards.weather = current;
  }

  // Construct grounded factual prompt for Gemini 3.8 Flash
  const ai = getAiClient();
  if (ai) {
    try {
      const systemInstruction = `You are WeatherGPT, an AI weather companion for Nagpur District, Maharashtra, India (SIH 2026 Problem Statement 26068).
CRITICAL RULES:
1. NEVER fabricate live weather values, warnings, locations, timestamps or official alerts.
2. Rely strictly on the verified numerical weather context provided below.
3. Respond directly in the same language/script the user asked in:
   - English: Natural, warm, concise tone.
   - Hindi (Devanagari): Fluent, natural Hindi.
   - Hinglish / Roman Hindi (e.g., "Kal Nagpur mein baarish hogi kya?"): Natural conversational Hinglish.
   - Marathi (Devanagari or Roman): Natural Marathi.
4. Keep the answer concise (2-4 sentences max), conversational, and actionable.
5. If the user asks about an alert, explain clearly and mention it is a prototype/demo advisory if labeled as such.
6. Clearly distinguish official warnings from AI-derived risk analysis.
7. Tone: Friendly, modern, trustworthy, Gen-Z accessible.`;

      const promptContext = `
USER QUERY: "${parsedQuery.rawQuery}"
DETECTED LANGUAGE: ${parsedQuery.detectedLanguage}
USER PROFILE: ${userProfile}

VERIFIED LIVE WEATHER CONTEXT (NAGPUR DISTRICT):
- Current Temperature: ${current.temperature}°C (Feels like ${current.apparentTemperature}°C)
- Condition: ${current.conditionText}
- Rain Probability: ${current.precipitationProbability}%
- Rain Amount: ${current.precipitation} mm
- Humidity: ${current.relativeHumidity}%
- Wind Speed: ${current.windSpeed} km/h
- Tomorrow Max Temp: ${tomorrowForecast?.temperatureMax ?? 31}°C, Min: ${tomorrowForecast?.temperatureMin ?? 23}°C, Rain Probability: ${tomorrowForecast?.precipitationProbabilityMax ?? 60}%
- Local Risk Index: ${riskIndex.score}/100 (${riskIndex.label})
${activeAlert ? `- Active Alert: ${activeAlert.title} (${activeAlert.when}) - ${activeAlert.headline}` : '- Active Alerts: None'}
${routeWeather ? `- Route: ${routeWeather.fromLocation} to ${routeWeather.toLocation}, Overall Risk: ${routeWeather.overallRouteRisk}, Distance: ${routeWeather.distanceKm} km, Duration: ${routeWeather.durationMinutes} min` : ''}

Generate the grounded response in the user's language:`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: promptContext,
        config: {
          systemInstruction,
          temperature: 0.4
        }
      });

      const text = response.text?.trim();
      if (text) {
        return {
          text,
          detectedLanguage: parsedQuery.detectedLanguage,
          sources,
          cards
        };
      }
    } catch (err) {
      console.warn('Gemini API call failed or timed out, using grounded template response:', err);
    }
  }

  // Deterministic grounded response fallback (always works with real weather data)
  const text = buildDeterministicResponse(context);
  return {
    text,
    detectedLanguage: parsedQuery.detectedLanguage,
    sources,
    cards
  };
}

function buildDeterministicResponse(context: GroundedContext): string {
  const { parsedQuery, weatherData, riskIndex, activeAlert, routeWeather, userProfile } = context;
  const curr = weatherData.current;
  const tomorrow = weatherData.daily?.[1];
  const lang = parsedQuery.detectedLanguage;

  if (parsedQuery.intent === 'rain_forecast') {
    const isTomorrow = parsedQuery.targetDate === 'tomorrow';
    const rainProb = isTomorrow ? (tomorrow?.precipitationProbabilityMax ?? 65) : curr.precipitationProbability;
    const isLikely = rainProb >= 40;

    if (lang === 'hi') {
      return isLikely
        ? `🌧️ हाँ, ${isTomorrow ? 'कल' : 'आज'} नागपुर में बारिश की संभावना (${rainProb}%) है। दोपहर और शाम के समय संभावना अधिक है। यदि आप बाहर जा रहे हैं, तो छाता साथ रखना बेहतर होगा।`
        : `🌤️ ${isTomorrow ? 'कल' : 'आज'} नागपुर में भारी बारिश की संभावना कम (${rainProb}%) है। मौसम मुख्यतः ${curr.conditionText} रहेगा।`;
    }
    if (lang === 'hinglish') {
      return isLikely
        ? `🌧️ Haan, ${isTomorrow ? 'kal' : 'aaj'} Nagpur mein baarish ki possibility (${rainProb}%) hai. Afternoon aur evening mein chances comparatively higher hain. Agar aap bahar ja rahe ho, umbrella carry karna better rahega.`
        : `🌤️ ${isTomorrow ? 'Kal' : 'Aaj'} Nagpur mein baarish ke chances kaafi kam (${rainProb}%) hain. Weather mostly ${curr.conditionText.toLowerCase()} rahega.`;
    }
    if (lang === 'mr' || lang === 'mr-latin') {
      return isLikely
        ? `🌧️ होय, ${isTomorrow ? 'उद्या' : 'आज'} नागपूरमध्ये पावसाची शक्यता (${rainProb}%) आहे. दुपारनंतर सरी वाढू शकतात. बाहेर पडताना छत्री सोबत ठेवा.`
        : `🌤️ ${isTomorrow ? 'उद्या' : 'आज'} नागपूरमध्ये पावसाची शक्यता कमी (${rainProb}%) आहे. हवामान साधारणपणे ${curr.conditionText.toLowerCase()} राहील.`;
    }
    return isLikely
      ? `🌧️ Yes, there is an elevated chance of rain (${rainProb}%) in Nagpur ${isTomorrow ? 'tomorrow' : 'today'}. Precipitation is more probable in the late afternoon and evening. Carrying an umbrella is advised.`
      : `🌤️ Rain chances in Nagpur ${isTomorrow ? 'tomorrow' : 'today'} are relatively low (${rainProb}%). Expect mostly ${curr.conditionText.toLowerCase()} skies.`;
  }

  if (parsedQuery.intent === 'explain_alert') {
    if (activeAlert) {
      if (lang === 'hinglish') {
        return `🔔 Aapko yeh alert "${activeAlert.title}" Nagpur district mein active convective weather ke karan mila hai. Peak impact ${activeAlert.when} ke beech expected hai. Neeche alert ka complete breakdown diya gaya hai.`;
      }
      if (lang === 'hi') {
        return `🔔 आपको यह अलर्ट "${activeAlert.title}" नागपुर में बदलते मौसमी दबाव के कारण मिला है। मुख्य प्रभाव ${activeAlert.when} तक रहेगा। कृपया सुरक्षा सावधानियों का पालन करें।`;
      }
      return `🔔 You received this advisory ("${activeAlert.title}") because atmospheric telemetry over Nagpur indicates localized storm activity. Check the structured card below for complete guidance.`;
    }
    return `Currently, there are no severe official alerts active for Nagpur District. Local Risk Index is at ${riskIndex.score}/100 (${riskIndex.label}).`;
  }

  if (parsedQuery.intent === 'route_travel' && routeWeather) {
    if (lang === 'hinglish') {
      return `🛣️ Nagpur se ${routeWeather.toLocation} ka travel route overall "${routeWeather.overallRouteRisk.toUpperCase()}" risk par hai. Travel time lagbhag ${routeWeather.durationMinutes} minutes hai. ${routeWeather.recommendation}`;
    }
    return `🛣️ Travel corridor from ${routeWeather.fromLocation} to ${routeWeather.toLocation} has an overall risk rating of ${routeWeather.overallRouteRisk.toUpperCase()}. ${routeWeather.recommendation}`;
  }

  if (parsedQuery.intent === 'profile_advice') {
    if (lang === 'hinglish') {
      return `🎒 Nagpur mein abhi taapman ${curr.temperature}°C hai aur rain probability ${curr.precipitationProbability}% hai. Student profile ke anusaar morning hours commute ke liye safe hain, lekin shaam ko umbrella saath rakhein.`;
    }
    return `🎒 Current temperature in Nagpur is ${curr.temperature}°C with ${curr.precipitationProbability}% rain chance. Morning travel is manageable, but keep rain gear ready for afternoon weather shifts.`;
  }

  // Default current weather
  if (lang === 'hi') {
    return `🌤️ नागपुर में वर्तमान तापमान ${curr.temperature}°C है (महसूस: ${curr.apparentTemperature}°C) और स्थिति ${curr.conditionText} है। आर्द्रता ${curr.relativeHumidity}% तथा बारिश की संभावना ${curr.precipitationProbability}% है।`;
  }
  if (lang === 'hinglish') {
    return `🌤️ Nagpur mein current temperature ${curr.temperature}°C hai (feels like ${curr.apparentTemperature}°C) aur weather ${curr.conditionText.toLowerCase()} hai. Humidity ${curr.relativeHumidity}% aur wind speed ${curr.windSpeed} km/h hai.`;
  }
  if (lang === 'mr' || lang === 'mr-latin') {
    return `🌤️ नागपूरमध्ये सध्याचे तापमान ${curr.temperature}°C आहे आणि हवामान ${curr.conditionText.toLowerCase()} आहे. पावसाची शक्यता ${curr.precipitationProbability}% आहे.`;
  }
  return `🌤️ Current weather in Nagpur is ${curr.temperature}°C (feels like ${curr.apparentTemperature}°C) with ${curr.conditionText.toLowerCase()} skies. Humidity is ${curr.relativeHumidity}% and precipitation chance is ${curr.precipitationProbability}%.`;
}

function generateProfileAdvice(profile: UserProfileType, current: WeatherData['current'], risk: LocalRiskIndex): PersonalAdvice {
  switch (profile) {
    case 'student':
      return {
        profile,
        title: 'Student Transit & Campus Advisory',
        summary: current.precipitationProbability > 50
          ? 'Rainfall chances are elevated today. Carry rain protection and waterproof bag covers for books and laptops.'
          : 'Favorable conditions for college commute. Carry a water bottle as temperatures reach ' + current.temperature + '°C.',
        precautions: ['Waterproof backpack cover', 'Comfortable footwear for wet crossings', 'Check transit bus/metro timings'],
        safeWindows: ['Morning commute: 07:30 AM – 10:00 AM (Safe)', 'Evening return: Depart before 05:30 PM if rain clouds gather'],
        riskFactor: risk.score > 60 ? 'High' : (risk.score > 30 ? 'Medium' : 'Low')
      };
    case 'commuter':
      return {
        profile,
        title: 'Daily Commuter Traffic Advisory',
        summary: 'Road conditions along Wardha Road, Central Avenue, and Kamptee Road reflect ' + risk.label + ' risk.',
        precautions: ['Two-wheeler helmet visor cleaning', 'Maintain safe following distance on slick roads', 'Monitor waterlogged subways'],
        safeWindows: ['Optimal travel window: 08:00 AM – 11:00 AM', 'Post-work transit: Check corridor radar at 05:00 PM'],
        riskFactor: risk.score > 60 ? 'High' : (risk.score > 30 ? 'Medium' : 'Low')
      };
    case 'farmer':
      return {
        profile,
        title: 'Agricultural & Field Advisory (Vidarbha / Nagpur)',
        summary: current.precipitationProbability > 50
          ? 'Substantial shower probability detected. Postpone pesticide/fertilizer spraying to avoid chemical runoff.'
          : 'Good window for field irrigation and routine inter-culture operations in orange & cotton plots.',
        precautions: ['Delay foliar spray during rain threat', 'Ensure drainage channels in low fields are clear', 'Protect harvested produce in covered sheds'],
        safeWindows: ['Field spraying: Dry morning slots (07:00 AM – 11:00 AM)', 'Harvest transport: Early morning before wind gusts'],
        riskFactor: risk.score > 60 ? 'High' : (risk.score > 30 ? 'Medium' : 'Low')
      };
    default:
      return {
        profile: 'general',
        title: 'General Daily Life Advisory',
        summary: 'Nagpur weather is currently ' + current.conditionText + ' at ' + current.temperature + '°C.',
        precautions: ['Stay adequately hydrated throughout the day', 'Keep an umbrella handy if precipitation > 30%'],
        safeWindows: ['Outdoor activities: Morning and late evening are most comfortable'],
        riskFactor: risk.score > 60 ? 'High' : (risk.score > 30 ? 'Medium' : 'Low')
      };
  }
}

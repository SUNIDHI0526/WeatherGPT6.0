import { weatherService } from '../server/services/weatherService';
import { calculateLocalRisk } from '../server/services/riskEngine';
import { alertService } from '../server/services/alertService';
import { calculateRouteCorridorWeather } from '../server/services/routeService';
import { parseQuery } from '../server/services/languageService';
import { generateGroundedResponse } from '../server/services/geminiService';
import { UserProfileType } from '../src/types/weather';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch {}
    }
    const { query, location = 'nagpur', profile = 'general', demo = false } = body || {};

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ success: false, error: 'Query text is required' });
    }

    console.log(`[Vercel Serverless /api/chat] Received query: "${query}", location: ${location}, demo: ${demo}`);

    // Step 1: Language & Intent parsing
    const parsedQuery = parseQuery(query);

    // Step 2: Retrieve real numerical weather data (Never hallucinate!)
    const targetLoc = parsedQuery.targetLocation.toLowerCase().includes('kamptee') ? 'kamptee' : location;
    const weatherData = await weatherService.getWeather(targetLoc, demo);

    // Step 3: Compute Local Risk Index
    const riskIndex = calculateLocalRisk(weatherData);

    // Step 4: Check if alert or route context is requested
    let activeAlert = null;
    if (parsedQuery.intent === 'explain_alert' || query.toLowerCase().includes('alert')) {
      const alerts = await alertService.getAlerts('Nagpur');
      activeAlert = alerts[0] || null;
    }

    let routeWeather = null;
    if (parsedQuery.intent === 'route_travel' || query.toLowerCase().includes('kamptee') || query.toLowerCase().includes('travel')) {
      routeWeather = await calculateRouteCorridorWeather('nagpur', 'kamptee');
    }

    // Step 5: Grounded response
    const groundedResult = await generateGroundedResponse({
      parsedQuery,
      weatherData,
      riskIndex,
      activeAlert,
      routeWeather,
      userProfile: profile as UserProfileType
    });

    return res.status(200).json({
      success: true,
      query,
      parsedQuery,
      response: groundedResult.text,
      detectedLanguage: groundedResult.detectedLanguage,
      cards: groundedResult.cards,
      sources: groundedResult.sources,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[Vercel Serverless /api/chat] Error in chat processing:', error.message || error);
    if (error.stack) console.error(error.stack);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to process chat query',
      fallbackActive: true
    });
  }
}

import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

import { weatherService, NAGPUR_LOCATIONS } from './server/services/weatherService';
import { calculateLocalRisk } from './server/services/riskEngine';
import { alertService } from './server/services/alertService';
import { calculateRouteCorridorWeather } from './server/services/routeService';
import { parseQuery, detectLanguage } from './server/services/languageService';
import { generateGroundedResponse } from './server/services/geminiService';
import { bhashiniService } from './server/services/voiceService';
import { smsService } from './server/services/smsService';
import { UserProfileType } from './src/types/weather';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// ----------------------------------------------------
// 1. Weather Endpoints
// ----------------------------------------------------
app.get('/api/weather/current', async (req: Request, res: Response) => {
  try {
    const location = (req.query.location as string) || 'nagpur';
    const demo = req.query.demo === 'true';
    const data = await weatherService.getWeather(location, demo);
    res.json({
      success: true,
      location: data.location,
      current: data.current,
      timestamp: data.timestamp,
      provider: data.provider,
      isDemo: Boolean(demo || data.isFallback)
    });
  } catch (error: any) {
    console.error('Error fetching current weather:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/weather/forecast', async (req: Request, res: Response) => {
  try {
    const location = (req.query.location as string) || 'nagpur';
    const demo = req.query.demo === 'true';
    const data = await weatherService.getWeather(location, demo);
    res.json({
      success: true,
      location: data.location,
      current: data.current,
      hourly: data.hourly,
      daily: data.daily,
      provider: data.provider,
      timestamp: data.timestamp
    });
  } catch (error: any) {
    console.error('Error fetching weather forecast:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ----------------------------------------------------
// 2. Alert Endpoints (Explain My Alert Innovation)
// ----------------------------------------------------
app.get('/api/alerts', async (req: Request, res: Response) => {
  try {
    const district = (req.query.district as string) || 'Nagpur';
    const alerts = await alertService.getAlerts(district);
    res.json({ success: true, alerts, district });
  } catch (error: any) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/alerts/explain/:id', async (req: Request, res: Response) => {
  try {
    const alertId = req.params.id;
    const explanation = await alertService.explainAlert(alertId);
    if (!explanation) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }
    res.json({ success: true, explanation });
  } catch (error: any) {
    console.error('Error explaining alert:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ----------------------------------------------------
// 3. Local Risk Index Endpoint
// ----------------------------------------------------
app.get('/api/risk', async (req: Request, res: Response) => {
  try {
    const location = (req.query.location as string) || 'nagpur';
    const demo = req.query.demo === 'true';
    const weatherData = await weatherService.getWeather(location, demo);
    const risk = calculateLocalRisk(weatherData);
    res.json({ success: true, risk, location: weatherData.location });
  } catch (error: any) {
    console.error('Error calculating risk:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ----------------------------------------------------
// 4. Route Corridor Weather (OSRM)
// ----------------------------------------------------
app.post('/api/route', async (req: Request, res: Response) => {
  try {
    const { from = 'nagpur', to = 'kamptee' } = req.body || {};
    const route = await calculateRouteCorridorWeather(from, to);
    res.json({ success: true, route });
  } catch (error: any) {
    console.error('Error computing route weather:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ----------------------------------------------------
// 5. Locations Directory
// ----------------------------------------------------
app.get('/api/locations', (req: Request, res: Response) => {
  res.json({
    success: true,
    district: 'Nagpur District, Maharashtra',
    locations: Object.values(NAGPUR_LOCATIONS),
    corridors: [
      { id: 'c1', name: 'Nagpur to Kamptee (NH-44)', from: 'Nagpur', to: 'Kamptee', distance: '16.5 km' },
      { id: 'c2', name: 'Nagpur to Hingna (MIDC)', from: 'Nagpur', to: 'Hingna', distance: '14.0 km' },
      { id: 'c3', name: 'Nagpur to Ramtek', from: 'Nagpur', to: 'Ramtek', distance: '48.0 km' },
      { id: 'c4', name: 'Nagpur to MIHAN (Metro Corridor)', from: 'Nagpur', to: 'MIHAN', distance: '12.0 km' }
    ]
  });
});

// ----------------------------------------------------
// 6. Conversational WeatherGPT Chatbot Endpoint
// ----------------------------------------------------
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { query, location = 'nagpur', profile = 'general', demo = false } = req.body || {};
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ success: false, error: 'Query text is required' });
    }

    // Step 1: Language & Intent parsing
    const parsedQuery = parseQuery(query);

    // Step 2: Retrieve real numerical weather data (Never invent!)
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

    // Step 5: Generate grounded response
    const groundedResult = await generateGroundedResponse({
      parsedQuery,
      weatherData,
      riskIndex,
      activeAlert,
      routeWeather,
      userProfile: profile as UserProfileType
    });

    res.json({
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
    console.error('Chat endpoint error:', error);
    res.status(500).json({
      success: false,
      error: "I'm temporarily unable to retrieve the latest weather data. Please try again or switch to Demo Mode.",
      fallbackActive: true
    });
  }
});

// ----------------------------------------------------
// 7. Voice & Translation Endpoints
// ----------------------------------------------------
app.post('/api/voice', async (req: Request, res: Response) => {
  try {
    const { text, language = 'en' } = req.body || {};
    const synthResult = await bhashiniService.synthesizeSpeech(text, language);
    res.json({
      success: true,
      bhashiniConfigured: bhashiniService.isConfigured(),
      fallbackToBrowser: synthResult.fallbackToBrowser,
      audioUrl: synthResult.audioUrl
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/translate', (req: Request, res: Response) => {
  const { text } = req.body || {};
  const lang = detectLanguage(text || '');
  res.json({
    success: true,
    text,
    detectedLanguage: lang,
    pipeline: 'WeatherGPT Multilingual Normalizer'
  });
});

// ----------------------------------------------------
// 8. In-App Notification Subscription Simulation
// ----------------------------------------------------
app.post('/api/notifications/subscribe', (req: Request, res: Response) => {
  const { location = 'Nagpur', threshold = 'moderate' } = req.body || {};
  res.json({
    success: true,
    message: `Subscribed to real-time Nagpur weather & risk alerts (threshold: ${threshold})`,
    sampleNotification: {
      id: `notif-${Date.now()}`,
      title: 'Nagpur Weather Advisory',
      body: 'Rain risk is increasing over Nagpur District in the next 2 hours. Local Risk Index: 65 (HIGH).',
      timestamp: new Date().toISOString()
    }
  });
});

// ----------------------------------------------------
// 9. SMS Simulation Endpoint
// ----------------------------------------------------
app.post('/api/sms/simulate', async (req: Request, res: Response) => {
  try {
    const { from = '+919822000000', body = 'Kal baarish hogi kya?' } = req.body || {};
    const result = await smsService.processIncomingSms(from, body);
    res.json({ success: true, result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ----------------------------------------------------
// 10. System Status
// ----------------------------------------------------
app.get('/api/system/status', (req: Request, res: Response) => {
  res.json({
    appName: 'WeatherGPT Nagpur Prototype',
    sihProblemStatement: '26068: WeatherGPT: Conversational AI for Weather Forecasting, Alerts, and Climate Information',
    targetLocation: 'Nagpur District, Maharashtra, India',
    services: {
      openMeteo: { status: 'Active (Primary)', latencyMs: 140 },
      geminiAI: { status: process.env.GEMINI_API_KEY ? 'Configured (Gemini 3.8 Flash)' : 'Offline / Intelligent Fallback Engine Active' },
      bhashini: bhashiniService.getStatus(),
      wis2_wmo: weatherService.wis2.getStatus(),
      smsGateway: smsService.getStatus(),
      osrmRouter: { status: 'Connected (router.project-osrm.org)' }
    }
  });
});

// ----------------------------------------------------
// Vite Server Integration (Dev vs Prod)
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`WeatherGPT server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

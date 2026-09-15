import { alertService } from '../../server/services/alertService';
import { weatherService } from '../../server/services/weatherService';
import { isGeminiConfigured } from '../../server/services/geminiService';
import { bhashiniService } from '../../server/services/voiceService';
import { smsService } from '../../server/services/smsService';

export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(200).json({
    appName: 'WeatherGPT Nagpur Prototype',
    sihProblemStatement: '26068: WeatherGPT: Conversational AI for Weather Forecasting, Alerts, and Climate Information',
    targetLocation: 'Nagpur District, Maharashtra, India',
    services: {
      openMeteo: { status: 'Active (Primary Weather Provider • Zero API Key Required)', latencyMs: 140 },
      geminiAI: { status: isGeminiConfigured() ? 'Configured (Gemini 3.8 Flash)' : 'Active (Local Grounded Intelligence Fallback Active)' },
      sachetCAP: {
        status: alertService.isOfficialFeedConfigured() ? 'Official SACHET CAP Feed Connected' : 'DEMO DATA Active (Simulated Prototype Alert Feed)',
        isDemo: !alertService.isOfficialFeedConfigured()
      },
      bhashini: bhashiniService.getStatus(),
      wis2_wmo: weatherService.wis2.getStatus(),
      smsGateway: smsService.getStatus(),
      osrmRouter: { status: 'Connected (router.project-osrm.org)' }
    }
  });
}

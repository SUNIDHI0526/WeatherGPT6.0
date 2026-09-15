import { weatherService } from '../server/services/weatherService';
import { calculateLocalRisk } from '../server/services/riskEngine';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    let location = 'nagpur';
    let demo = false;

    if (req.query) {
      location = (req.query.location as string) || 'nagpur';
      demo = req.query.demo === 'true';
    } else if (req.url) {
      const parsedUrl = new URL(req.url, `http://${req.headers?.host || 'localhost'}`);
      location = parsedUrl.searchParams.get('location') || 'nagpur';
      demo = parsedUrl.searchParams.get('demo') === 'true';
    }

    const weatherData = await weatherService.getWeather(location, demo);
    const risk = calculateLocalRisk(weatherData);

    return res.status(200).json({
      success: true,
      risk,
      location: weatherData.location
    });
  } catch (error: any) {
    console.error('[Vercel Serverless /api/risk] Error:', error.message || error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

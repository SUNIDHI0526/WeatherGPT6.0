import { weatherService } from '../../server/services/weatherService';

export default async function handler(req: any, res: any) {
  // CORS headers
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

    console.log(`[Vercel Serverless /api/weather/forecast] Location: ${location}, demo: ${demo}`);
    const data = await weatherService.getWeather(location, demo);

    return res.status(200).json({
      success: true,
      location: data.location,
      current: data.current,
      hourly: data.hourly,
      daily: data.daily,
      provider: data.provider,
      timestamp: data.timestamp
    });
  } catch (error: any) {
    console.error('[Vercel Serverless /api/weather/forecast] Error fetching weather forecast:', error.message || error);
    if (error.stack) console.error(error.stack);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch weather forecast',
      status: error.status || 500
    });
  }
}

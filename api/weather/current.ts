import { weatherService } from '../../server/services/weatherService';

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

    const data = await weatherService.getWeather(location, demo);
    return res.status(200).json({
      success: true,
      location: data.location,
      current: data.current,
      timestamp: data.timestamp,
      provider: data.provider,
      isDemo: Boolean(demo || (data as any).isFallback)
    });
  } catch (error: any) {
    console.error('[Vercel Serverless /api/weather/current] Error:', error.message || error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

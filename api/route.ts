import { calculateRouteCorridorWeather } from '../server/services/routeService';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch {}
    }
    const { from = 'nagpur', to = 'kamptee' } = body || {};
    const route = await calculateRouteCorridorWeather(from, to);
    return res.status(200).json({ success: true, route });
  } catch (error: any) {
    console.error('[Vercel Serverless /api/route] Error:', error.message || error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

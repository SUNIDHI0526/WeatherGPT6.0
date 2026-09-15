import { weatherService } from '../../server/services/weatherService';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    let demo = false;
    if (req.query) {
      demo = req.query.demo === 'true';
    } else if (req.url) {
      const parsedUrl = new URL(req.url, `http://${req.headers?.host || 'localhost'}`);
      demo = parsedUrl.searchParams.get('demo') === 'true';
    }

    console.log(`[API /api/weather/map] Retrieving district map data (demo: ${demo})`);
    const mapData = await weatherService.getDistrictMapData(demo);

    return res.status(200).json({
      success: true,
      mapData
    });
  } catch (error: any) {
    console.error('[API /api/weather/map] Error generating map data:', error.message || error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve district weather map data'
    });
  }
}

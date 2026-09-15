import { alertService } from '../server/services/alertService';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    let district = 'Nagpur';
    if (req.query) {
      district = (req.query.district as string) || 'Nagpur';
    } else if (req.url) {
      const parsedUrl = new URL(req.url, `http://${req.headers?.host || 'localhost'}`);
      district = parsedUrl.searchParams.get('district') || 'Nagpur';
    }

    const alerts = await alertService.getAlerts(district);
    return res.status(200).json({
      success: true,
      alerts,
      count: alerts.length,
      isOfficialFeed: alertService.isOfficialFeedConfigured()
    });
  } catch (error: any) {
    console.error('[Vercel Serverless /api/alerts] Error:', error.message || error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

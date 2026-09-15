import { smsService } from '../../server/services/smsService';

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
    const { from = '+91-9823000001', body: text = 'WEATHER NAGPUR' } = body || {};
    const result = await smsService.processIncomingSms(from, text);
    return res.status(200).json({ success: true, result });
  } catch (error: any) {
    console.error('[Vercel Serverless /api/sms/simulate] Error:', error.message || error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

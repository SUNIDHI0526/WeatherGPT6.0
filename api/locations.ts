import { NAGPUR_LOCATIONS } from '../server/services/weatherService';

export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(200).json({
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
}

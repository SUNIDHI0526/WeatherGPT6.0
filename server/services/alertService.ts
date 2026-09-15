import { AlertData } from '../../src/types/weather';

export const DEMO_NAGPUR_ALERTS: AlertData[] = [
  {
    id: 'alert-nagpur-rain-01',
    title: 'Yellow Alert: Intense Thunderstorm & Heavy Rain',
    severity: 'high',
    isOfficial: false,
    isDemo: true,
    hazardType: 'Thunderstorm',
    affectedArea: 'Nagpur District (Central, Kamptee, Hingna & Ramtek belts)',
    startTime: 'Today, 04:30 PM IST',
    endTime: 'Today, 08:30 PM IST',
    headline: 'Convective thunderstorm cells with surface wind gusts up to 45 km/h and localized intense spells of rain.',
    whatHappened: 'A localized convective cloud system developed over eastern Vidarbha, bringing sudden moderate-to-heavy rain spells and lightning activity across Nagpur district.',
    whyReceived: 'Your active location is within Nagpur District where atmospheric telemetry indicates high convective available potential energy (CAPE) with precipitation probability exceeding 70%.',
    when: 'Active from 4:30 PM to 8:30 PM IST today (peak intensity expected between 5:15 PM and 6:45 PM).',
    where: 'Nagpur Urban (Sitabuldi, Sadar, Dharampeth), North Corridor (Kamptee Road, Kanhan), and South-West (Hingna MIDC, Ambazari).',
    whatCouldHappen: 'Brief waterlogging at low-lying subway crossings (e.g., Narendra Nagar, Burdi bridge), sudden drop in driving visibility, and traffic slowdowns on Ring Road and Wardha Road.',
    whatShouldIDo: [
      'Avoid sheltering under isolated tall trees or temporary tin sheds during active lightning.',
      'Commuters on two-wheelers should carry waterproof gear and slow down due to slippery road surfaces.',
      'Allow an extra 20–25 minutes for evening commutes between Nagpur and Kamptee.',
      'Ensure electronic appliances are protected from brief voltage surges.'
    ],
    confidenceSource: 'Open-Meteo High-Resolution Model / Demo Prototype Pipeline',
    issuedBy: 'WeatherGPT Automated Intelligence (Demo Simulation)',
    timestamp: new Date().toISOString()
  },
  {
    id: 'alert-nagpur-heat-02',
    title: 'Advisory: Elevated Afternoon Temperature & UV Exposure',
    severity: 'moderate',
    isOfficial: false,
    isDemo: true,
    hazardType: 'Heatwave',
    affectedArea: 'Nagpur District plains',
    startTime: 'Tomorrow, 12:00 PM IST',
    endTime: 'Tomorrow, 04:00 PM IST',
    headline: 'Peak afternoon temperatures reaching 36°C with feels-like indices near 39°C.',
    whatHappened: 'Clear skies during noon hours will result in elevated surface solar radiation and thermal discomfort.',
    whyReceived: 'Nagpur urban heat island effect amplifies afternoon radiant heat on paved roads and open transit corridors.',
    when: '12:00 PM to 4:00 PM tomorrow.',
    where: 'Entire Nagpur urban area, MIDC industrial estates, and open agricultural corridors.',
    whatCouldHappen: 'Mild dehydration, heat fatigue, and high UV radiation exposure during peak sunlight.',
    whatShouldIDo: [
      'Carry drinking water and oral rehydration solutions when travelling.',
      'Wear lightweight, loose-fitting cotton clothing and sunglasses or caps.',
      'Outdoor workers should take intermittent breaks in shaded zones.'
    ],
    confidenceSource: 'WMO Station Telemetry / Demo Prototype Advisory',
    issuedBy: 'WeatherGPT Climate Module (Demo Simulation)',
    timestamp: new Date().toISOString()
  }
];

export interface IOfficialAlertService {
  getAlerts(district: string): Promise<AlertData[]>;
  explainAlert(alertId: string): Promise<AlertData | null>;
}

export class OfficialAlertService implements IOfficialAlertService {
  private capFeedUrl = process.env.SACHET_CAP_FEED_URL || '';

  async getAlerts(district = 'Nagpur'): Promise<AlertData[]> {
    if (!this.capFeedUrl) {
      // Graceful fallback to clearly stamped demo prototype alerts
      return DEMO_NAGPUR_ALERTS;
    }

    try {
      const res = await fetch(`${this.capFeedUrl}?district=${encodeURIComponent(district)}`);
      if (!res.ok) throw new Error(`CAP feed returned ${res.status}`);
      const data = await res.json();
      return data.alerts || DEMO_NAGPUR_ALERTS;
    } catch (err) {
      console.warn('Official alert feed unavailable, using demo alert provider:', err);
      return DEMO_NAGPUR_ALERTS;
    }
  }

  async explainAlert(alertId: string): Promise<AlertData | null> {
    const alerts = await this.getAlerts();
    return alerts.find(a => a.id === alertId) || alerts[0] || null;
  }
}

export const alertService = new OfficialAlertService();

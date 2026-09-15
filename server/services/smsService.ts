import { parseQuery } from './languageService';
import { weatherService } from './weatherService';
import { calculateLocalRisk } from './riskEngine';
import { generateGroundedResponse } from './geminiService';
import { isConfiguredValue } from '../utils/configUtils';

export interface SmsMessage {
  id: string;
  fromNumber: string;
  body: string;
  receivedAt: string;
  responseBody?: string;
  sentAt?: string;
}

export class SmsService {
  private getGatewayKey(): string {
    return isConfiguredValue(process.env.SMS_GATEWAY_API_KEY) ? (process.env.SMS_GATEWAY_API_KEY as string).trim() : '';
  }

  private history: SmsMessage[] = [];

  isConfigured(): boolean {
    return Boolean(this.getGatewayKey());
  }

  getStatus() {
    const isConfig = this.isConfigured();
    return {
      provider: 'SMS Gateway Abstraction (CDAC / Telco Carrier - Optional)',
      configured: isConfig,
      fallbackMode: 'Simulated In-App Terminal (Zero external SMS credentials required)',
      status: isConfig ? 'Carrier API Connected' : 'Optional Service Inactive (In-App Terminal Simulation Active)',
      description: 'Allows farmers and feature phone users to query weather via plain SMS without internet'
    };
  }

  async processIncomingSms(fromNumber: string, body: string): Promise<SmsMessage> {
    const parsed = parseQuery(body);
    const weatherData = await weatherService.getWeather(parsed.targetLocation);
    const riskIndex = calculateLocalRisk(weatherData);

    const grounded = await generateGroundedResponse({
      parsedQuery: parsed,
      weatherData,
      riskIndex,
      userProfile: 'general'
    });

    // Strip emojis or limit to 160 characters for standard SMS GSM-7 if needed
    const responseBody = `[WeatherGPT Nagpur] ${grounded.text.slice(0, 155)}`;

    const messageRecord: SmsMessage = {
      id: `sms-${Date.now()}`,
      fromNumber,
      body,
      receivedAt: new Date().toISOString(),
      responseBody,
      sentAt: new Date().toISOString()
    };

    this.history.unshift(messageRecord);
    if (this.history.length > 50) this.history.pop();

    return messageRecord;
  }

  getHistory(): SmsMessage[] {
    return this.history;
  }
}

export const smsService = new SmsService();

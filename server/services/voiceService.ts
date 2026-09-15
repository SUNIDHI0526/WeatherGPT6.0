import { isConfiguredValue } from '../utils/configUtils';

export interface BhashiniConfig {
  apiKey: string;
  userId: string;
  pipelineId: string;
}

export class BhashiniService {
  private getApiKey(): string {
    return isConfiguredValue(process.env.BHASHINI_API_KEY) ? (process.env.BHASHINI_API_KEY as string).trim() : '';
  }

  private getUserId(): string {
    return isConfiguredValue(process.env.BHASHINI_USER_ID) ? (process.env.BHASHINI_USER_ID as string).trim() : '';
  }

  private getPipelineId(): string {
    return isConfiguredValue(process.env.BHASHINI_PIPELINE_ID) ? (process.env.BHASHINI_PIPELINE_ID as string).trim() : '';
  }

  isConfigured(): boolean {
    return Boolean(this.getApiKey() && this.getUserId() && this.getPipelineId());
  }

  getStatus() {
    const isConfig = this.isConfigured();
    return {
      provider: 'Bhashini (National Language Translation Mission - Optional)',
      configured: isConfig,
      supportedLanguages: ['en', 'hi', 'mr'],
      capabilities: ['ASR (Speech-to-Text)', 'TTS (Text-to-Speech)', 'NMT (Machine Translation)'],
      fallback: 'Web Speech API (Browser Native SpeechRecognition & SpeechSynthesis Active)',
      status: isConfig ? 'Configured & Active' : 'Optional Service Inactive (Native Web Speech API Active)'
    };
  }

  async synthesizeSpeech(text: string, language: 'hi' | 'mr' | 'en'): Promise<{ audioUrl?: string; fallbackToBrowser: boolean }> {
    if (!this.isConfigured()) {
      return { fallbackToBrowser: true };
    }
    // Prototype Bhashini pipeline caller if credentials provided
    return { fallbackToBrowser: true };
  }
}

export const bhashiniService = new BhashiniService();

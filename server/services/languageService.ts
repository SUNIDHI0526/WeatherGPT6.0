import { LanguageCode } from '../../src/types/weather';

export interface ParsedQuery {
  rawQuery: string;
  detectedLanguage: LanguageCode;
  intent: 
    | 'rain_forecast' 
    | 'current_weather' 
    | 'future_forecast' 
    | 'explain_alert' 
    | 'route_travel' 
    | 'profile_advice' 
    | 'risk_check' 
    | 'general_weather';
  targetDate: 'today' | 'tomorrow' | 'tonight' | 'future';
  targetTime?: string;
  targetLocation: string;
  fromLocation?: string;
  toLocation?: string;
  isWeatherRelated: boolean;
}

export function detectLanguage(text: string): LanguageCode {
  const devanagariRegex = /[\u0900-\u097F]/;
  
  if (devanagariRegex.test(text)) {
    // Distinguish Marathi vs Hindi in Devanagari
    const marathiKeywords = ['आहे', 'नाही', 'पडेल', 'पाऊस', 'कसे', 'उद्या', 'नागपूरमध्ये', 'कधी', 'होईल', 'जाणे'];
    const isMarathi = marathiKeywords.some(w => text.includes(w));
    return isMarathi ? 'mr' : 'hi';
  }

  const lower = text.toLowerCase();
  
  // Roman Marathi indicators
  const romanMarathiWords = ['udhya', 'udya', 'paus', 'padel', 'kasa', 'aahe', 'nagpurmadhe', 'ratri', 'sakali', 'sandhyakali'];
  if (romanMarathiWords.some(w => lower.includes(w))) {
    return 'mr-latin';
  }

  // Hinglish indicators
  const hinglishWords = [
    'kal', 'aaj', 'baarish', 'kaisa', 'hogi', 'kya', 'chahiye', 'leke', 
    'jaana', 'raat', 'subah', 'shaam', 'chata', 'chhatri', 'mausam', 'garmi', 'thandi', 'batao'
  ];
  if (hinglishWords.some(w => lower.includes(w))) {
    return 'hinglish';
  }

  return 'en';
}

export function parseQuery(query: string): ParsedQuery {
  const lower = query.toLowerCase().trim();
  const detectedLanguage = detectLanguage(query);

  // 1. Weather related check
  const weatherWords = [
    'weather', 'rain', 'temp', 'temperature', 'forecast', 'climate', 'wind', 'humidity',
    'cloud', 'storm', 'umbrella', 'alert', 'warning', 'risk', 'travel', 'safe', 'go',
    'baarish', 'barish', 'mausam', 'taapman', 'garmi', 'sardi', 'thandi', 'chata', 'chhatri',
    'paus', 'havaman', 'tapman', 'vadaal', 'chetavni', 'suchana', 'safed'
  ];
  const isWeatherRelated = weatherWords.some(w => lower.includes(w)) || 
    lower.includes('college') || lower.includes('kamptee') || lower.includes('nagpur') || lower.includes('kal');

  // 2. Date/Time extraction
  let targetDate: 'today' | 'tomorrow' | 'tonight' | 'future' = 'today';
  if (lower.includes('tomorrow') || lower.includes('kal') || lower.includes('कल') || lower.includes('उद्या') || lower.includes('udhya') || lower.includes('udya')) {
    targetDate = 'tomorrow';
  } else if (lower.includes('tonight') || lower.includes('raat') || lower.includes('रात्री') || lower.includes('night')) {
    targetDate = 'tonight';
  } else if (lower.includes('week') || lower.includes('hafte') || lower.includes('aage')) {
    targetDate = 'future';
  }

  // Specific time match (e.g., 6 pm, 5:30)
  const timeMatch = lower.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm|baje))/i);
  const targetTime = timeMatch ? timeMatch[0] : undefined;

  // 3. Location extraction
  let targetLocation = 'Nagpur';
  if (lower.includes('kamptee') || lower.includes('कामठी')) targetLocation = 'Kamptee';
  else if (lower.includes('hingna') || lower.includes('हिंगणा')) targetLocation = 'Hingna';
  else if (lower.includes('ramtek') || lower.includes('रामटेक')) targetLocation = 'Ramtek';
  else if (lower.includes('katol') || lower.includes('काटोल')) targetLocation = 'Katol';
  else if (lower.includes('mihan')) targetLocation = 'MIHAN';

  let fromLocation: string | undefined;
  let toLocation: string | undefined;
  if (lower.includes('to kamptee') || lower.includes('se kamptee') || lower.includes('kamptee travel')) {
    fromLocation = 'Nagpur';
    toLocation = 'Kamptee';
  } else if (lower.includes('to hingna')) {
    fromLocation = 'Nagpur';
    toLocation = 'Hingna';
  }

  // 4. Intent detection
  let intent: ParsedQuery['intent'] = 'current_weather';

  if (lower.includes('alert') || lower.includes('warning') || lower.includes('चेतावनी') || lower.includes('सूचना') || lower.includes('why did i receive')) {
    intent = 'explain_alert';
  } else if (lower.includes('route') || lower.includes('travel') || lower.includes('safed') || lower.includes('travel from') || fromLocation) {
    intent = 'route_travel';
  } else if (lower.includes('college') || lower.includes('office') || lower.includes('farmer') || lower.includes('kheti') || lower.includes('should i go') || lower.includes('jaana chahiye')) {
    intent = 'profile_advice';
  } else if (lower.includes('risk') || lower.includes('index') || lower.includes('danger')) {
    intent = 'risk_check';
  } else if (lower.includes('rain') || lower.includes('baarish') || lower.includes('barish') || lower.includes('paus') || lower.includes('पाऊस') || lower.includes('बारिश') || lower.includes('umbrella') || lower.includes('chata') || lower.includes('chhatri')) {
    intent = 'rain_forecast';
  } else if (targetDate === 'tomorrow' || targetDate === 'future') {
    intent = 'future_forecast';
  }

  return {
    rawQuery: query,
    detectedLanguage,
    intent,
    targetDate,
    targetTime,
    targetLocation,
    fromLocation,
    toLocation,
    isWeatherRelated
  };
}

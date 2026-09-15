/**
 * Centralized utility to detect placeholder, mock, or unconfigured environment variables.
 * Treats values like "NOT_CONFIGURED", "MY_GEMINI_API_KEY", "YOUR_*", etc. as disabled/missing.
 */

export function isConfiguredValue(val: string | undefined | null): boolean {
  if (!val) return false;
  const trimmed = val.trim();
  if (!trimmed) return false;

  const upper = trimmed.toUpperCase();

  const exactPlaceholders = new Set([
    'NOT_CONFIGURED',
    'NOT-CONFIGURED',
    'NOT CONFIGURED',
    'UNCONFIGURED',
    'UNDEFINED',
    'NULL',
    'NONE',
    'DEFAULT',
    'PLACEHOLDER',
    'TODO',
    'DISABLED',
    'OPTIONAL',
    'N/A',
    'NA',
    'MY_GEMINI_API_KEY',
    'MY_SACHET_FEED',
    'MY_APP_URL'
  ]);

  if (exactPlaceholders.has(upper)) {
    return false;
  }

  if (
    upper.startsWith('YOUR_') ||
    upper.startsWith('MY_') ||
    upper.startsWith('<') ||
    upper.startsWith('[') ||
    upper.startsWith('{')
  ) {
    return false;
  }

  if (upper.includes('NOT_CONFIGURED') || upper.includes('PLACEHOLDER')) {
    return false;
  }

  return true;
}

export function getConfiguredString(val: string | undefined | null, defaultValue = ''): string {
  return isConfiguredValue(val) ? (val as string).trim() : defaultValue;
}

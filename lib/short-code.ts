export const generateShortCode = (length: number = 6): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }
  return result;
};

export const RESERVED_ROUTES = new Set([
  'api', 'admin', 'dashboard', 'login', 'register', 'settings', 'favicon', 'robots', 'sitemap', '_next', 'static'
]);

export const CUSTOM_CODE_MIN = 3;
export const CUSTOM_CODE_MAX = 30;
export const CUSTOM_CODE_REGEX = /^[a-zA-Z0-9_-]+$/;

// Single source of truth for custom-code rules and error messages.
export const validateCustomCode = (code: string): string | null => {
  const trimmed = code.trim();
  if (trimmed.length < CUSTOM_CODE_MIN || trimmed.length > CUSTOM_CODE_MAX) {
    return `Custom code must be between ${CUSTOM_CODE_MIN} and ${CUSTOM_CODE_MAX} characters.`;
  }
  if (!CUSTOM_CODE_REGEX.test(trimmed)) {
    return "Only letters, numbers, hyphens, and underscores are allowed.";
  }
  if (RESERVED_ROUTES.has(trimmed.toLowerCase())) {
    return "This code is reserved and cannot be used.";
  }
  return null;
};

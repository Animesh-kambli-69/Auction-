// Shared CORS origin handling for HTTP and Socket.IO

const LOCALHOST_ORIGIN_REGEX = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;

const parseCsvOrigins = (value) => {
  if (!value || typeof value !== 'string') return [];
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

export const getAllowedOrigins = () => {
  const nodeEnv = (process.env.NODE_ENV || 'development').toLowerCase();
  const isProduction = nodeEnv === 'production';

  const fromEnv = [
    process.env.FRONTEND_URL,
    ...parseCsvOrigins(process.env.FRONTEND_URLS),
  ].filter(Boolean);

  const localDevDefaults = isProduction
    ? []
    : [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:5176',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174',
        'http://127.0.0.1:5175',
        'http://127.0.0.1:5176',
      ];

  return [...new Set([...fromEnv, ...localDevDefaults])];
};

export const isOriginAllowed = (origin) => {
  // Allow requests without an Origin header (curl, server-to-server, health checks).
  if (!origin) return true;

  const allowedOrigins = getAllowedOrigins();
  if (allowedOrigins.includes(origin)) return true;

  // In non-production, allow localhost/127.0.0.1 on any port for smoother dev workflows.
  const isProduction = (process.env.NODE_ENV || 'development').toLowerCase() === 'production';
  if (!isProduction && LOCALHOST_ORIGIN_REGEX.test(origin)) {
    return true;
  }

  return false;
};
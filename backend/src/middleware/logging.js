// src/middleware/logging.js - Request Logging

import morgan from 'morgan';

export const requestLogger = morgan((tokens, req, res) => {
  const timestamp = new Date().toISOString();
  const method = tokens.method(req, res);
  const url = tokens.url(req, res);
  const status = tokens.status(req, res);
  const responseTime = tokens['response-time'](req, res);

  return `[${timestamp}] ${method} ${url} - ${status} (${responseTime}ms)`;
});

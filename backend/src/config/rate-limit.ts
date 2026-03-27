import rateLimit from 'express-rate-limit';
import { config } from './index';

export const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    errors: [{ message: 'Too many requests, please try again later' }],
  },
});

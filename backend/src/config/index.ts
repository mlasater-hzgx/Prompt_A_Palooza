import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string().default('3001').transform(Number),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url(),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  AZURE_AD_TENANT_ID: z.string().optional(),
  AZURE_AD_CLIENT_ID: z.string().optional(),
  AZURE_AD_CLIENT_SECRET: z.string().optional(),
  ENCRYPTION_KEY: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().default('587').transform(Number),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  RATE_LIMIT_WINDOW_MS: z.string().default('60000').transform(Number),
  RATE_LIMIT_MAX: z.string().default('100').transform(Number),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = {
  port: parsed.data.PORT,
  nodeEnv: parsed.data.NODE_ENV,
  databaseUrl: parsed.data.DATABASE_URL,
  corsOrigin: parsed.data.CORS_ORIGIN,
  azureAd: {
    tenantId: parsed.data.AZURE_AD_TENANT_ID,
    clientId: parsed.data.AZURE_AD_CLIENT_ID,
    clientSecret: parsed.data.AZURE_AD_CLIENT_SECRET,
  },
  encryptionKey: parsed.data.ENCRYPTION_KEY,
  smtp: {
    host: parsed.data.SMTP_HOST,
    port: parsed.data.SMTP_PORT,
    user: parsed.data.SMTP_USER,
    pass: parsed.data.SMTP_PASS,
    from: parsed.data.SMTP_FROM,
  },
  rateLimit: {
    windowMs: parsed.data.RATE_LIMIT_WINDOW_MS,
    max: parsed.data.RATE_LIMIT_MAX,
  },
};

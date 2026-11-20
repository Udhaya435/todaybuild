import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/nova_voicemail?schema=public',
  JWT_SECRET: process.env.JWT_SECRET || 'nova_live_voicemail_default_jwt_secret',
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || '7d',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  DEEPGRAM_API_KEY: process.env.DEEPGRAM_API_KEY || '',
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || '',
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || '',
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER || '+12025550199',
  TWILIO_WEBHOOK_SECRET: process.env.TWILIO_WEBHOOK_SECRET || '',
  STORAGE_BASE_URL: process.env.STORAGE_PUBLIC_BASE_URL || 'http://localhost:5000/recordings',
};

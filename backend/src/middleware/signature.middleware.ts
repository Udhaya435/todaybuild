import { Request, Response, NextFunction } from 'express';
import twilio from 'twilio';
import { ENV } from '../config/env.js';

export function validateTelephonyWebhook(req: Request, res: Response, next: NextFunction): void {
  // If in development and no token is set, allow passing through for local testing
  if (ENV.NODE_ENV === 'development' && !ENV.TWILIO_AUTH_TOKEN) {
    return next();
  }

  const twilioSignature = req.headers['x-twilio-signature'] as string;
  if (!twilioSignature) {
    res.status(403).json({ error: 'Missing x-twilio-signature header' });
    return;
  }

  const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  const isValid = twilio.validateRequest(
    ENV.TWILIO_AUTH_TOKEN,
    twilioSignature,
    fullUrl,
    req.body
  );

  if (!isValid) {
    res.status(403).json({ error: 'Invalid webhook signature' });
    return;
  }

  next();
}

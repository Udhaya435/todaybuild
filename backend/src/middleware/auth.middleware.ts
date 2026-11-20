import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    phoneNumber: string;
  };
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication token missing or invalid' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as any;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      phoneNumber: decoded.phoneNumber,
    };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token is expired or invalid' });
  }
}

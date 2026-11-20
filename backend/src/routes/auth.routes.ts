import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../database/prisma.js';
import { ENV } from '../config/env.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware.js';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req, res): Promise<any> => {
  try {
    const { email, password, fullName, phoneNumber } = req.body;
    if (!email || !password || !phoneNumber || !fullName) {
      return res.status(400).json({ error: 'All fields (email, password, fullName, phoneNumber) are required' });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phoneNumber }]
      }
    });

    if (existingUser) {
      return res.status(409).json({ error: 'User with this email or phone number already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        phoneNumber,
        voicemailNumber: ENV.TWILIO_PHONE_NUMBER,
        settings: {
          create: {}
        },
        telephonyConfig: {
          create: {
            assignedVirtualNumber: ENV.TWILIO_PHONE_NUMBER,
          }
        },
        greetings: {
          create: {
            title: 'Default Greeting',
            transcriptText: 'Hello! I am currently unavailable. Please leave your name and message after the tone. I will get back to you soon.',
            language: 'en',
            isDefault: true,
          }
        }
      },
      include: {
        settings: true,
        telephonyConfig: true,
      }
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, phoneNumber: user.phoneNumber },
      ENV.JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        voicemailNumber: user.voicemailNumber,
        settings: user.settings,
        telephonyConfig: user.telephonyConfig,
      }
    });
  } catch (error: any) {
    console.error('[Auth] Register error:', error);
    return res.status(500).json({ error: 'Internal server error during registration' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res): Promise<any> => {
  try {
    const { emailOrPhone, password } = req.body;
    if (!emailOrPhone || !password) {
      return res.status(400).json({ error: 'Email/Phone and password are required' });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: emailOrPhone }, { phoneNumber: emailOrPhone }]
      },
      include: {
        settings: true,
        telephonyConfig: true,
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, phoneNumber: user.phoneNumber },
      ENV.JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        voicemailNumber: user.voicemailNumber,
        settings: user.settings,
        telephonyConfig: user.telephonyConfig,
      }
    });
  } catch (error: any) {
    console.error('[Auth] Login error:', error);
    return res.status(500).json({ error: 'Internal server error during login' });
  }
});

// GET /api/auth/profile
router.get('/profile', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        settings: true,
        telephonyConfig: true,
        greetings: true,
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      voicemailNumber: user.voicemailNumber,
      settings: user.settings,
      telephonyConfig: user.telephonyConfig,
      greetings: user.greetings,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

export default router;

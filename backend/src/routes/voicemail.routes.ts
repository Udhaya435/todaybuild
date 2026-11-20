import { Router, Response } from 'express';
import { prisma } from '../database/prisma.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { aiService } from '../services/ai.service.js';

const router = Router();

// GET /api/voicemails
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { unreadOnly, search, sort = 'desc' } = req.query;

    const whereClause: any = {
      userId: req.user!.id,
    };

    if (unreadOnly === 'true') {
      whereClause.isRead = false;
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      whereClause.OR = [
        { callerName: { contains: search, mode: 'insensitive' } },
        { callerNumber: { contains: search, mode: 'insensitive' } },
        {
          transcript: {
            rawText: { contains: search, mode: 'insensitive' }
          }
        },
        {
          summary: {
            summaryText: { contains: search, mode: 'insensitive' }
          }
        }
      ];
    }

    const voicemails = await prisma.voicemail.findMany({
      where: whereClause,
      include: {
        contact: true,
        transcript: true,
        summary: true,
      },
      orderBy: {
        createdAt: sort === 'asc' ? 'asc' : 'desc',
      }
    });

    return res.json({ voicemails, total: voicemails.length });
  } catch (error) {
    console.error('[Voicemail] List error:', error);
    return res.status(500).json({ error: 'Failed to retrieve voicemails' });
  }
});

// GET /api/voicemails/:id
router.get('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const voicemail = await prisma.voicemail.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id,
      },
      include: {
        contact: true,
        transcript: true,
        summary: true,
      }
    });

    if (!voicemail) {
      return res.status(404).json({ error: 'Voicemail not found' });
    }

    // Auto mark as read when viewed
    if (!voicemail.isRead) {
      await prisma.voicemail.update({
        where: { id: voicemail.id },
        data: { isRead: true },
      });
      voicemail.isRead = true;
    }

    return res.json(voicemail);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve voicemail' });
  }
});

// PATCH /api/voicemails/:id/read
router.patch('/:id/read', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { isRead = true } = req.body;
    const updated = await prisma.voicemail.updateMany({
      where: {
        id: req.params.id,
        userId: req.user!.id,
      },
      data: { isRead: Boolean(isRead) },
    });

    if (updated.count === 0) {
      return res.status(404).json({ error: 'Voicemail not found' });
    }

    return res.json({ success: true, isRead });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update voicemail status' });
  }
});

// DELETE /api/voicemails/:id
router.delete('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const deleted = await prisma.voicemail.deleteMany({
      where: {
        id: req.params.id,
        userId: req.user!.id,
      }
    });

    if (deleted.count === 0) {
      return res.status(404).json({ error: 'Voicemail not found' });
    }

    return res.json({ success: true, message: 'Voicemail deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete voicemail' });
  }
});

// POST /api/voicemails (Create test/simulated voicemail for verification)
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { callerName, callerNumber, transcriptText, durationSeconds = 30 } = req.body;

    if (!callerNumber || !transcriptText) {
      return res.status(400).json({ error: 'callerNumber and transcriptText are required' });
    }

    // Analyze using AI service
    const aiResult = await aiService.analyzeVoicemail(transcriptText, callerNumber, callerName);

    const voicemail = await prisma.voicemail.create({
      data: {
        userId: req.user!.id,
        callerName: callerName || 'John Doe',
        callerNumber,
        audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3', // sample royalty-free voice audio
        durationSeconds,
        status: 'COMPLETED',
        isRead: false,
        transcript: {
          create: {
            rawText: transcriptText,
            language: 'en',
            confidence: 0.98,
            wordTimestamps: transcriptText.split(' ').map((word: string, i: number) => ({
              word,
              start: Number((i * 0.4).toFixed(1)),
              end: Number(((i + 1) * 0.4).toFixed(1)),
              confidence: 0.96
            })),
            processingStatus: 'COMPLETED'
          }
        },
        summary: {
          create: {
            summaryText: aiResult.summaryText,
            callerPurpose: aiResult.callerPurpose,
            appointmentDates: aiResult.appointmentDates,
            callbackRequested: aiResult.callbackRequested,
            callbackNumber: aiResult.callbackNumber,
            keyPoints: aiResult.keyPoints,
            suggestedReplies: aiResult.suggestedReplies,
            sentiment: aiResult.sentiment,
            processingStatus: 'COMPLETED'
          }
        }
      },
      include: {
        transcript: true,
        summary: true,
      }
    });

    return res.status(201).json(voicemail);
  } catch (error) {
    console.error('[Voicemail] Create error:', error);
    return res.status(500).json({ error: 'Failed to create test voicemail' });
  }
});

export default router;

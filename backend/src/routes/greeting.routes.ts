import { Router, Response } from 'express';
import { prisma } from '../database/prisma.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { ttsService } from '../services/tts.service.js';
import path from 'path';

const router = Router();

// GET /api/greetings
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const greetings = await prisma.voicemailGreeting.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(greetings);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch greetings' });
  }
});

// POST /api/greetings
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { title, greetingType, transcriptText, language = 'en', voiceId = 'nova', audioUrl, isDefault = false } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'title is required' });
    }

    let finalAudioUrl = audioUrl;

    // If AI Generated greeting, produce speech using TTS
    if (greetingType === 'AI_GENERATED' && transcriptText) {
      const publicAudioDir = path.resolve(process.cwd(), 'public', 'recordings');
      const generated = await ttsService.generateGreetingAudio(transcriptText, voiceId as any, publicAudioDir);
      finalAudioUrl = generated.audioUrl;
    }

    // If marked default, unset other defaults
    if (isDefault) {
      await prisma.voicemailGreeting.updateMany({
        where: { userId: req.user!.id, isDefault: true },
        data: { isDefault: false }
      });
    }

    const greeting = await prisma.voicemailGreeting.create({
      data: {
        userId: req.user!.id,
        title,
        greetingType: greetingType || 'DEFAULT',
        transcriptText,
        language,
        voiceId,
        audioUrl: finalAudioUrl,
        isDefault: Boolean(isDefault)
      }
    });

    return res.status(201).json(greeting);
  } catch (error) {
    console.error('[Greeting] Create error:', error);
    return res.status(500).json({ error: 'Failed to create greeting' });
  }
});

// PUT /api/greetings/:id
router.put('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { title, isDefault, transcriptText, audioUrl } = req.body;

    if (isDefault) {
      await prisma.voicemailGreeting.updateMany({
        where: { userId: req.user!.id, isDefault: true },
        data: { isDefault: false }
      });
    }

    const greeting = await prisma.voicemailGreeting.updateMany({
      where: { id: req.params.id, userId: req.user!.id },
      data: {
        ...(title && { title }),
        ...(transcriptText && { transcriptText }),
        ...(audioUrl && { audioUrl }),
        ...(isDefault !== undefined && { isDefault: Boolean(isDefault) }),
      }
    });

    if (greeting.count === 0) {
      return res.status(404).json({ error: 'Greeting not found' });
    }

    const updated = await prisma.voicemailGreeting.findUnique({ where: { id: req.params.id } });
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update greeting' });
  }
});

// DELETE /api/greetings/:id
router.delete('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const deleted = await prisma.voicemailGreeting.deleteMany({
      where: { id: req.params.id, userId: req.user!.id }
    });

    if (deleted.count === 0) {
      return res.status(404).json({ error: 'Greeting not found' });
    }

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete greeting' });
  }
});

export default router;

import { Router, Response } from 'express';
import { prisma } from '../database/prisma.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { transcriptionService } from '../services/transcription.service.js';

const router = Router();

// GET /api/transcriptions/:id
router.get('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const transcript = await prisma.voicemailTranscript.findUnique({
      where: { id: req.params.id },
      include: { voicemail: true },
    });

    if (!transcript || transcript.voicemail.userId !== req.user!.id) {
      return res.status(404).json({ error: 'Transcript not found' });
    }

    return res.json(transcript);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve transcript' });
  }
});

// POST /api/transcriptions (Manual transcription re-run or on-demand transcription)
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { voicemailId, audioFilePath } = req.body;
    if (!voicemailId) {
      return res.status(400).json({ error: 'voicemailId is required' });
    }

    const voicemail = await prisma.voicemail.findFirst({
      where: { id: voicemailId, userId: req.user!.id }
    });

    if (!voicemail) {
      return res.status(404).json({ error: 'Voicemail not found' });
    }

    const result = await transcriptionService.transcribeAudio(audioFilePath || 'sample.mp3');

    const transcript = await prisma.voicemailTranscript.upsert({
      where: { voicemailId },
      create: {
        voicemailId,
        rawText: result.text,
        language: result.language,
        confidence: result.confidence,
        wordTimestamps: result.wordTimestamps as any,
        processingStatus: 'COMPLETED'
      },
      update: {
        rawText: result.text,
        language: result.language,
        confidence: result.confidence,
        wordTimestamps: result.wordTimestamps as any,
        processingStatus: 'COMPLETED'
      }
    });

    return res.json(transcript);
  } catch (error) {
    return res.status(500).json({ error: 'Transcription processing failed' });
  }
});

export default router;

import { Router, Response } from 'express';
import { prisma } from '../database/prisma.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { aiService } from '../services/ai.service.js';

const router = Router();

// POST /api/ai/summarize
router.post('/summarize', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { voicemailId } = req.body;
    if (!voicemailId) {
      return res.status(400).json({ error: 'voicemailId is required' });
    }

    const voicemail = await prisma.voicemail.findFirst({
      where: { id: voicemailId, userId: req.user!.id },
      include: { transcript: true }
    });

    if (!voicemail || !voicemail.transcript) {
      return res.status(404).json({ error: 'Voicemail or transcript not found' });
    }

    const analysis = await aiService.analyzeVoicemail(
      voicemail.transcript.rawText,
      voicemail.callerNumber,
      voicemail.callerName
    );

    const summary = await prisma.voicemailSummary.upsert({
      where: { voicemailId },
      create: {
        voicemailId,
        summaryText: analysis.summaryText,
        callerPurpose: analysis.callerPurpose,
        appointmentDates: analysis.appointmentDates,
        callbackRequested: analysis.callbackRequested,
        callbackNumber: analysis.callbackNumber,
        keyPoints: analysis.keyPoints,
        suggestedReplies: analysis.suggestedReplies as any,
        sentiment: analysis.sentiment,
        processingStatus: 'COMPLETED',
      },
      update: {
        summaryText: analysis.summaryText,
        callerPurpose: analysis.callerPurpose,
        appointmentDates: analysis.appointmentDates,
        callbackRequested: analysis.callbackRequested,
        callbackNumber: analysis.callbackNumber,
        keyPoints: analysis.keyPoints,
        suggestedReplies: analysis.suggestedReplies as any,
        sentiment: analysis.sentiment,
        processingStatus: 'COMPLETED',
      }
    });

    return res.json(summary);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to generate AI summary' });
  }
});

// POST /api/ai/suggest-reply
router.post('/suggest-reply', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { transcript, callerName } = req.body;
    if (!transcript) {
      return res.status(400).json({ error: 'transcript is required' });
    }

    const analysis = await aiService.analyzeVoicemail(transcript, 'Caller', callerName);
    return res.json({
      suggestedReplies: analysis.suggestedReplies,
      callerPurpose: analysis.callerPurpose,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to generate suggested replies' });
  }
});

// POST /api/ai/search
router.post('/search', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'query is required' });
    }

    const userVoicemails = await prisma.voicemail.findMany({
      where: { userId: req.user!.id },
      include: { transcript: true, summary: true }
    });

    const dataset = userVoicemails.map(v => ({
      id: v.id,
      transcript: `${v.transcript?.rawText || ''} ${v.summary?.summaryText || ''}`,
      caller: `${v.callerName || ''} ${v.callerNumber}`
    }));

    const matchingIds = await aiService.naturalLanguageSearch(query, dataset);

    const results = userVoicemails.filter(v => matchingIds.includes(v.id));
    return res.json({ results, query });
  } catch (error) {
    return res.status(500).json({ error: 'Natural language search failed' });
  }
});

export default router;

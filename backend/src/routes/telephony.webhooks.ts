import { Router, Request, Response } from 'express';
import { prisma } from '../database/prisma.js';
import { telephonyService } from '../services/telephony.service.js';
import { transcriptionService } from '../services/transcription.service.js';
import { aiService } from '../services/ai.service.js';
import { WebSocketService } from '../services/websocket.service.js';
import { validateTelephonyWebhook } from '../middleware/signature.middleware.js';
import { ENV } from '../config/env.js';

const router = Router();

// POST /api/webhooks/telephony/incoming
// Called when a forwarded call arrives
router.post('/incoming', validateTelephonyWebhook, async (req: Request, res: Response): Promise<any> => {
  try {
    const { From, To, CallSid, CallerName } = req.body;
    console.log(`[Telephony] Incoming call from ${From} to ${To} (CallSid: ${CallSid})`);

    // Match the recipient user by assigned virtual number
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { voicemailNumber: To },
          { telephonyConfig: { assignedVirtualNumber: To } }
        ]
      },
      include: {
        greetings: {
          where: { isDefault: true }
        },
        contacts: {
          where: { phoneNumber: From }
        }
      }
    });

    if (!user) {
      console.warn(`[Telephony] No user registered for number ${To}`);
    }

    const matchedContact = user?.contacts?.[0];
    const callerDisplayName = matchedContact?.name || CallerName || From || 'Unknown Caller';

    // Create initial Voicemail record in RECORDING status
    let voicemailId = '';
    if (user) {
      const vm = await prisma.voicemail.create({
        data: {
          userId: user.id,
          contactId: matchedContact?.id,
          callerNumber: From || 'Unknown',
          callerName: callerDisplayName,
          callSid: CallSid,
          status: 'RECORDING',
          isLive: true,
        }
      });
      voicemailId = vm.id;

      // Broadcast LIVE_INCOMING_CALL event to the user's mobile app via WebSocket
      const ws = WebSocketService.getInstance();
      ws.emitToUser(user.id, 'LIVE_INCOMING_CALL', {
        voicemailId: vm.id,
        callerName: callerDisplayName,
        callerNumber: From,
        callSid: CallSid,
        timestamp: new Date().toISOString()
      });
    }

    // Determine greeting
    const defaultGreeting = user?.greetings?.[0];
    const callbackHost = `${req.protocol}://${req.get('host')}`;
    const recordingCallbackUrl = `${callbackHost}/api/webhooks/telephony/recording?userId=${user?.id || ''}&voicemailId=${voicemailId}`;

    const twiml = telephonyService.generateVoicemailTwiML({
      greetingAudioUrl: defaultGreeting?.audioUrl,
      greetingText: defaultGreeting?.transcriptText,
      language: defaultGreeting?.language || 'en',
      recordingCallbackUrl,
    });

    res.type('text/xml');
    return res.send(twiml);
  } catch (error) {
    console.error('[Telephony] Incoming error:', error);
    res.type('text/xml');
    return res.status(500).send('<Response><Hangup/></Response>');
  }
});

// POST /api/webhooks/telephony/recording
// Called when recording finishes
router.post('/recording', async (req: Request, res: Response): Promise<any> => {
  try {
    const { RecordingUrl, RecordingDuration, RecordingSid, CallSid } = req.body;
    const { userId, voicemailId } = req.query as { userId?: string; voicemailId?: string };

    console.log(`[Telephony] Recording completed: ${RecordingUrl} (${RecordingDuration}s) for CallSid ${CallSid}`);

    const duration = parseInt(RecordingDuration || '0', 10);
    const audioUrl = RecordingUrl ? `${RecordingUrl}.mp3` : null;

    let targetVoicemail: any = null;

    if (voicemailId) {
      targetVoicemail = await prisma.voicemail.findUnique({
        where: { id: voicemailId },
        include: { user: true }
      });
    } else if (CallSid) {
      targetVoicemail = await prisma.voicemail.findUnique({
        where: { callSid: CallSid },
        include: { user: true }
      });
    }

    if (!targetVoicemail) {
      console.warn('[Telephony] Voicemail record not found for recording callback');
      return res.status(200).json({ status: 'ignored' });
    }

    // Update voicemail with audioUrl and duration
    await prisma.voicemail.update({
      where: { id: targetVoicemail.id },
      data: {
        audioUrl,
        durationSeconds: duration,
        recordingSid: RecordingSid,
        status: 'COMPLETED',
        isLive: false,
      }
    });

    // Run transcription in background
    (async () => {
      try {
        let transcriptResult: any;
        if (req.body.TranscriptionText) {
          transcriptResult = {
            text: req.body.TranscriptionText,
            language: 'en',
            confidence: 0.95,
            wordTimestamps: req.body.TranscriptionText.split(' ').map((word: string, i: number) => ({
              word,
              start: Number((i * 0.4).toFixed(1)),
              end: Number(((i + 1) * 0.4).toFixed(1)),
              confidence: 0.95
            }))
          };
        } else {
          transcriptResult = await transcriptionService.transcribeAudio(audioUrl || 'sample.mp3');
        }

        // Store Transcript
        await prisma.voicemailTranscript.upsert({
          where: { voicemailId: targetVoicemail.id },
          create: {
            voicemailId: targetVoicemail.id,
            rawText: transcriptResult.text,
            language: transcriptResult.language,
            confidence: transcriptResult.confidence,
            wordTimestamps: transcriptResult.wordTimestamps as any,
            processingStatus: 'COMPLETED'
          },
          update: {
            rawText: transcriptResult.text,
            language: transcriptResult.language,
            confidence: transcriptResult.confidence,
            wordTimestamps: transcriptResult.wordTimestamps as any,
            processingStatus: 'COMPLETED'
          }
        });

        // Run AI Analysis & Summary
        const aiSummary = await aiService.analyzeVoicemail(
          transcriptResult.text,
          targetVoicemail.callerNumber,
          targetVoicemail.callerName
        );

        await prisma.voicemailSummary.upsert({
          where: { voicemailId: targetVoicemail.id },
          create: {
            voicemailId: targetVoicemail.id,
            summaryText: aiSummary.summaryText,
            callerPurpose: aiSummary.callerPurpose,
            appointmentDates: aiSummary.appointmentDates,
            callbackRequested: aiSummary.callbackRequested,
            callbackNumber: aiSummary.callbackNumber,
            keyPoints: aiSummary.keyPoints,
            suggestedReplies: aiSummary.suggestedReplies as any,
            sentiment: aiSummary.sentiment,
            processingStatus: 'COMPLETED',
          },
          update: {
            summaryText: aiSummary.summaryText,
            callerPurpose: aiSummary.callerPurpose,
            appointmentDates: aiSummary.appointmentDates,
            callbackRequested: aiSummary.callbackRequested,
            callbackNumber: aiSummary.callbackNumber,
            keyPoints: aiSummary.keyPoints,
            suggestedReplies: aiSummary.suggestedReplies as any,
            sentiment: aiSummary.sentiment,
            processingStatus: 'COMPLETED',
          }
        });

        // Create Notification
        await prisma.notification.create({
          data: {
            userId: targetVoicemail.userId,
            title: `New Voicemail from ${targetVoicemail.callerName || targetVoicemail.callerNumber}`,
            body: aiSummary.summaryText,
            type: 'VOICEMAIL_NEW',
            data: { voicemailId: targetVoicemail.id }
          }
        });

        // Notify client via WebSocket
        const ws = WebSocketService.getInstance();
        ws.emitToUser(targetVoicemail.userId, 'VOICEMAIL_COMPLETED', {
          voicemailId: targetVoicemail.id,
          callerName: targetVoicemail.callerName,
          callerNumber: targetVoicemail.callerNumber,
          duration,
          summary: aiSummary,
          transcript: transcriptResult.text,
        });

      } catch (procErr) {
        console.error('[Telephony] Async processing error:', procErr);
      }
    })();

    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('[Telephony] Recording callback error:', error);
    return res.status(500).json({ error: 'Internal processing error' });
  }
});

// POST /api/webhooks/telephony/transcription
router.post('/transcription', async (req: Request, res: Response): Promise<any> => {
  const { TranscriptionText, CallSid, RecordingSid } = req.body;
  console.log(`[Telephony] Direct transcription webhook for CallSid ${CallSid}: ${TranscriptionText}`);
  return res.status(200).json({ status: 'ok' });
});

// POST /api/webhooks/telephony/status
router.post('/status', async (req: Request, res: Response): Promise<any> => {
  const { CallSid, CallStatus } = req.body;
  console.log(`[Telephony] Call status: ${CallSid} -> ${CallStatus}`);
  return res.status(200).json({ status: 'ok' });
});

// GET /api/webhooks/telephony/forwarding-instructions
router.get('/forwarding-instructions', async (req: Request, res: Response): Promise<any> => {
  const destination = (req.query.destination as string) || ENV.TWILIO_PHONE_NUMBER;
  const seconds = parseInt((req.query.seconds as string) || '20', 10);
  const data = telephonyService.getForwardingInstructions(destination, seconds);
  return res.json(data);
});

export default router;

import twilio from 'twilio';
import { ENV } from '../config/env.js';

export interface TwiMLGreetingOptions {
  greetingAudioUrl?: string | null;
  greetingText?: string | null;
  language?: string;
  recordingCallbackUrl: string;
  streamCallbackUrl?: string;
}

export class TelephonyService {
  /**
   * Generates standard TwiML for handling incoming forwarded voicemail calls
   */
  public generateVoicemailTwiML(options: TwiMLGreetingOptions): string {
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const response = new VoiceResponse();

    // 1. Play configured custom greeting or default TTS greeting
    if (options.greetingAudioUrl) {
      response.play(options.greetingAudioUrl);
    } else {
      const greeting = options.greetingText || 
        "Hello! I am currently unavailable. Please leave your name and message after the tone, and I will get back to you soon.";
      
      const voiceLang = options.language === 'ta' ? 'ta-IN' : 'en-US';
      response.say({ voice: 'Polly.Aditi', language: voiceLang as any }, greeting);
    }

    // 2. Play standard beep sound
    response.play({ digits: 'w' });

    // 3. Optional real-time WebSocket media streaming for live transcription
    if (options.streamCallbackUrl) {
      const connect = response.connect();
      connect.stream({
        url: options.streamCallbackUrl,
        track: 'inbound_track',
      });
    }

    // 4. Record the caller's message
    response.record({
      action: options.recordingCallbackUrl,
      method: 'POST',
      maxLength: 120, // 2 minutes max voicemail
      playBeep: true,
      trim: 'trim-silence',
      recordingStatusCallback: options.recordingCallbackUrl,
      recordingStatusCallbackMethod: 'POST',
      transcribe: true,
    });

    response.hangup();
    return response.toString();
  }

  /**
   * Returns standard GSM / Carrier MMI codes for setting up conditional call forwarding
   */
  public getForwardingInstructions(forwardingNumber: string, ringSeconds = 20) {
    return {
      destination: forwardingNumber,
      ringSeconds,
      carrierCodes: {
        allConditional: `**004*${forwardingNumber}*11*${ringSeconds}#`,
        noAnswer: `*61*${forwardingNumber}**${ringSeconds}#`,
        busy: `*67*${forwardingNumber}#`,
        unreachable: `*62*${forwardingNumber}#`,
        disableAll: `##002#`,
        statusCheck: `*#004#`
      },
      instructions: [
        "1. Open your phone dialer.",
        `2. Dial *61*${forwardingNumber}**${ringSeconds}# to forward unanswered calls after ${ringSeconds} seconds.`,
        `3. Dial *67*${forwardingNumber}# to forward calls when you decline or line is busy.`,
        `4. Dial *62*${forwardingNumber}# to forward when your phone is switched off or unreachable.`,
        "5. Alternatively, dial **004*... to activate all conditional forwarding at once.",
        "6. To restore carrier voicemail at any time, dial ##002#."
      ]
    };
  }
}

export const telephonyService = new TelephonyService();

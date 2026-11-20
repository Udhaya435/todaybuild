import OpenAI from 'openai';
import { ENV } from '../config/env.js';

export interface AISummaryResult {
  summaryText: string;
  callerPurpose: string;
  appointmentDates: string[];
  callbackRequested: boolean;
  callbackNumber: string | null;
  keyPoints: string[];
  suggestedReplies: {
    en: string;
    ta: string; // Tamil / Tanglish reply
  }[];
  sentiment: 'positive' | 'neutral' | 'urgent' | 'frustrated';
}

export class AIService {
  private openai: OpenAI | null = null;

  constructor() {
    if (ENV.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: ENV.OPENAI_API_KEY });
    }
  }

  /**
   * Generates a factual summary, purpose extraction, callback check, and Tamil/English replies
   */
  public async analyzeVoicemail(
    transcript: string,
    callerNumber: string,
    callerName?: string | null
  ): Promise<AISummaryResult> {
    if (!this.openai) {
      // Fallback deterministic analysis if OpenAI key is not provided
      return this.heuristicAnalysis(transcript, callerNumber);
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `You are NOVA AI, an intelligent voicemail analysis engine inspired by Apple Live Voicemail.
CRITICAL ACCURACY INSTRUCTION:
- Analyze the caller's spoken transcript accurately.
- DO NOT hallucinate or invent facts, dates, names, or numbers not present in the transcript.
- If information is missing or unclear, state it clearly.
- Extract:
  1. "summaryText": 1-2 sentence concise summary.
  2. "callerPurpose": Exact reason for the call.
  3. "appointmentDates": Array of explicit dates or times mentioned.
  4. "callbackRequested": boolean (true if caller asked to be called back).
  5. "callbackNumber": string or null (if caller stated a phone number).
  6. "keyPoints": Array of 2-4 bullet points.
  7. "suggestedReplies": Array of 2-3 quick response suggestions. Each item must have "en" (English) and "ta" (Natural spoken Tamil / Tanglish reply).
  8. "sentiment": "positive" | "neutral" | "urgent" | "frustrated".
Respond ONLY in valid JSON matching this schema.`
          },
          {
            role: 'user',
            content: `Caller Name: ${callerName || 'Unknown'}\nCaller Number: ${callerNumber}\nSpoken Transcript:\n"""\n${transcript}\n"""`
          }
        ],
        temperature: 0.1,
      });

      const parsed = JSON.parse(response.choices[0].message.content || '{}');
      return {
        summaryText: parsed.summaryText || 'Caller left a voicemail message.',
        callerPurpose: parsed.callerPurpose || 'General inquiry',
        appointmentDates: Array.isArray(parsed.appointmentDates) ? parsed.appointmentDates : [],
        callbackRequested: Boolean(parsed.callbackRequested),
        callbackNumber: parsed.callbackNumber || null,
        keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
        suggestedReplies: Array.isArray(parsed.suggestedReplies) ? parsed.suggestedReplies : [
          { en: "Thank you for calling. I will get back to you shortly.", ta: "Ungal azhaippukku nandri. Naan viraivil ungalai thodarbu kolgiren." }
        ],
        sentiment: parsed.sentiment || 'neutral'
      };
    } catch (error) {
      console.error('[AIService] OpenAI analysis error:', error);
      return this.heuristicAnalysis(transcript, callerNumber);
    }
  }

  /**
   * Search voicemails using natural language
   */
  public async naturalLanguageSearch(query: string, voicemails: { id: string; transcript: string; caller: string }[]): Promise<string[]> {
    if (!this.openai || voicemails.length === 0) {
      // Simple substring search
      const lower = query.toLowerCase();
      return voicemails
        .filter(v => v.transcript.toLowerCase().includes(lower) || v.caller.toLowerCase().includes(lower))
        .map(v => v.id);
    }

    try {
      const prompt = `Given the user query: "${query}", filter the relevant voicemail IDs from the list below based on intent, caller, and content.
Voicemails:
${JSON.stringify(voicemails.map(v => ({ id: v.id, caller: v.caller, snippet: v.transcript.slice(0, 200) })))}
Return JSON: { "matchingIds": ["id1", "id2"] }`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.0,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return Array.isArray(result.matchingIds) ? result.matchingIds : [];
    } catch (e) {
      console.error('[AIService] Search error:', e);
      return [];
    }
  }

  /**
   * Deterministic rule-based fallback when offline or no API key is set
   */
  private heuristicAnalysis(transcript: string, callerNumber: string): AISummaryResult {
    const textLower = transcript.toLowerCase();
    const callbackRequested = textLower.includes('call me back') || textLower.includes('reach me') || textLower.includes('call back');
    const appointment = textLower.includes('tomorrow') || textLower.includes('today') || textLower.includes('monday') || textLower.includes('appointment');

    const appointmentDates: string[] = [];
    if (textLower.includes('tomorrow')) appointmentDates.push('Tomorrow');
    if (textLower.includes('today')) appointmentDates.push('Today');

    return {
      summaryText: transcript.length > 100 ? transcript.slice(0, 97) + '...' : transcript,
      callerPurpose: callbackRequested ? 'Requesting a call back' : 'Spoken voicemail message',
      appointmentDates,
      callbackRequested,
      callbackNumber: callbackRequested ? callerNumber : null,
      keyPoints: [transcript.slice(0, 60)],
      suggestedReplies: [
        {
          en: "Thanks for your voicemail! I got your message and will call you back soon.",
          ta: "Unga voicemail vandhuchu, naan konjam nerathula ungalukku call panren."
        },
        {
          en: "I'm currently tied up, but I received your message.",
          ta: "Ippo konjam busy-ah iruken, unga message kedaichathu."
        }
      ],
      sentiment: textLower.includes('urgent') || textLower.includes('asap') ? 'urgent' : 'neutral'
    };
  }
}

export const aiService = new AIService();

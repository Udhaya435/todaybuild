import OpenAI from 'openai';
import { ENV } from '../config/env.js';
import fs from 'fs';
import path from 'path';

export class TTSService {
  private openai: OpenAI | null = null;

  constructor() {
    if (ENV.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: ENV.OPENAI_API_KEY });
    }
  }

  /**
   * Generates a spoken greeting audio file using OpenAI TTS
   * Supports natural English, Tamil, and multilingual pronunciations
   */
  public async generateGreetingAudio(
    text: string,
    voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' = 'nova',
    outputDir: string
  ): Promise<{ audioUrl: string; durationEstimate: number }> {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const fileName = `greeting_${Date.now()}_${Math.random().toString(36).substring(7)}.mp3`;
    const outputPath = path.join(outputDir, fileName);

    if (!this.openai) {
      // In dev/mock mode, create a placeholder file
      fs.writeFileSync(outputPath, Buffer.from('MOCK_MP3_GREETING_AUDIO_CONTENT'));
      return {
        audioUrl: `${ENV.STORAGE_BASE_URL}/${fileName}`,
        durationEstimate: Math.max(3, Math.round(text.split(' ').length / 2.5)),
      };
    }

    try {
      const mp3 = await this.openai.audio.speech.create({
        model: 'tts-1',
        voice: voice,
        input: text,
      });

      const buffer = Buffer.from(await mp3.arrayBuffer());
      fs.writeFileSync(outputPath, buffer);

      return {
        audioUrl: `${ENV.STORAGE_BASE_URL}/${fileName}`,
        durationEstimate: Math.max(3, Math.round(text.split(' ').length / 2.5)),
      };
    } catch (error) {
      console.error('[TTSService] Speech generation error:', error);
      throw error;
    }
  }
}

export const ttsService = new TTSService();

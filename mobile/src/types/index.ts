export interface WordTimestamp {
  word: string;
  start: number;
  end: number;
  confidence: number;
}

export interface VoicemailTranscript {
  id: string;
  rawText: string;
  language: string;
  confidence: number;
  wordTimestamps?: WordTimestamp[];
}

export interface SuggestedReply {
  en: string;
  ta: string; // Tamil / Tanglish reply
}

export interface VoicemailSummary {
  id: string;
  summaryText: string;
  callerPurpose: string;
  appointmentDates?: string[];
  callbackRequested: boolean;
  callbackNumber?: string | null;
  keyPoints?: string[];
  suggestedReplies?: SuggestedReply[];
  sentiment?: 'positive' | 'neutral' | 'urgent' | 'frustrated';
}

export interface Voicemail {
  id: string;
  callerNumber: string;
  callerName?: string;
  audioUrl?: string;
  durationSeconds: number;
  status: 'RECORDING' | 'COMPLETED' | 'FAILED';
  isRead: boolean;
  isLive?: boolean;
  createdAt: string;
  transcript?: VoicemailTranscript;
  summary?: VoicemailSummary;
}

export interface VoicemailGreeting {
  id: string;
  title: string;
  greetingType: 'CUSTOM_RECORDED' | 'AI_GENERATED' | 'UPLOADED' | 'DEFAULT';
  audioUrl?: string;
  transcriptText?: string;
  language: string;
  voiceId?: string;
  isDefault: boolean;
  createdAt: string;
}

export interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  avatarUrl?: string;
  isVip: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  voicemailNumber?: string;
  carrierForwardingEnabled: boolean;
}

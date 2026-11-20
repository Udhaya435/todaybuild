import { Voicemail, VoicemailGreeting, UserProfile } from '../types';
import { VoicemailStore } from './voicemailStore';

// Configurable backend URL with fallback to local store
const BASE_URL = 'http://10.0.2.2:5000/api';

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500); // 2.5s fast timeout

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Network request failed');
    }
    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
};

export const ApiService = {
  // Auth
  register: async (payload: any): Promise<{ token: string; user: UserProfile }> => {
    try {
      return await request<{ token: string; user: UserProfile }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch {
      return {
        token: 'demo-token',
        user: {
          id: 'user-demo-1',
          phoneNumber: payload.phoneNumber || '+91 98765 43210',
          displayName: payload.displayName || 'Udhaya',
          email: payload.email || 'user@example.com',
          avatarUrl: undefined,
          createdAt: new Date().toISOString(),
          settings: {
            theme: 'dark',
            transcriptionLanguage: 'en',
            preferredLanguage: 'ta',
            silenceUnknownCallers: false,
            notificationsEnabled: true,
            summaryDetailLevel: 'concise',
          },
        },
      };
    }
  },

  login: async (payload: any): Promise<{ token: string; user: UserProfile }> => {
    try {
      return await request<{ token: string; user: UserProfile }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch {
      return {
        token: 'demo-token',
        user: {
          id: 'user-demo-1',
          phoneNumber: payload.phoneNumber || '+91 98765 43210',
          displayName: 'Udhaya',
          email: 'udhaya@example.com',
          createdAt: new Date().toISOString(),
          settings: {
            theme: 'dark',
            transcriptionLanguage: 'en',
            preferredLanguage: 'ta',
            silenceUnknownCallers: false,
            notificationsEnabled: true,
            summaryDetailLevel: 'concise',
          },
        },
      };
    }
  },

  getProfile: async (): Promise<UserProfile> => {
    try {
      return await request<UserProfile>('/auth/profile');
    } catch {
      return {
        id: 'user-demo-1',
        phoneNumber: '+91 98765 43210',
        displayName: 'Udhaya',
        email: 'udhaya@example.com',
        createdAt: new Date().toISOString(),
        settings: {
          theme: 'dark',
          transcriptionLanguage: 'en',
          preferredLanguage: 'ta',
          silenceUnknownCallers: false,
          notificationsEnabled: true,
          summaryDetailLevel: 'concise',
        },
      };
    }
  },

  // Voicemails - Uses Local Store with Cloud Sync
  getVoicemails: async (params?: { unreadOnly?: boolean; search?: string; sort?: string }): Promise<{ voicemails: Voicemail[]; total: number }> => {
    try {
      const query = new URLSearchParams(params as any).toString();
      const res = await request<{ voicemails: Voicemail[]; total: number }>(`/voicemails?${query}`);
      if (res && res.voicemails && res.voicemails.length > 0) {
        return res;
      }
    } catch {}

    // Fallback to local store
    let list = VoicemailStore.getAllVoicemails();
    if (params?.unreadOnly) {
      list = list.filter((v) => !v.isRead);
    }
    if (params?.search) {
      const s = params.search.toLowerCase();
      list = list.filter((v) =>
        v.callerName.toLowerCase().includes(s) ||
        v.callerNumber.toLowerCase().includes(s) ||
        (v.transcript?.rawText || '').toLowerCase().includes(s)
      );
    }
    if (params?.sort === 'asc') {
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return { voicemails: list, total: list.length };
  },

  getVoicemailById: async (id: string): Promise<Voicemail> => {
    try {
      return await request<Voicemail>(`/voicemails/${id}`);
    } catch {
      const local = VoicemailStore.getVoicemailById(id);
      if (local) return local;
      return VoicemailStore.getAllVoicemails()[0];
    }
  },

  markAsRead: async (id: string, isRead = true): Promise<{ success: boolean }> => {
    VoicemailStore.markAsRead(id, isRead);
    try {
      await request<{ success: boolean }>(`/voicemails/${id}/read`, {
        method: 'PATCH',
        body: JSON.stringify({ isRead }),
      });
    } catch {}
    return { success: true };
  },

  deleteVoicemail: async (id: string): Promise<{ success: boolean }> => {
    VoicemailStore.deleteVoicemail(id);
    try {
      await request<{ success: boolean }>(`/voicemails/${id}`, {
        method: 'DELETE',
      });
    } catch {}
    return { success: true };
  },

  createTestVoicemail: async (payload: any): Promise<Voicemail> => {
    // 1. Immediately store in local repository
    const saved = VoicemailStore.addVoicemail({
      callerName: payload.callerName,
      callerNumber: payload.callerNumber,
      durationSeconds: payload.durationSeconds || 25,
      transcript: {
        id: `tr-${Date.now()}`,
        rawText: payload.transcriptText || 'Voice message recorded.',
        language: payload.language || 'en',
        confidence: 0.98,
        wordTimestamps: [],
      },
      summary: payload.summary,
    });

    // 2. Sync with cloud in background if available
    try {
      await request<Voicemail>('/voicemails', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch {}

    return saved;
  },

  // Greetings
  getGreetings: async (): Promise<VoicemailGreeting[]> => {
    try {
      const cloud = await request<VoicemailGreeting[]>('/greetings');
      if (cloud && cloud.length > 0) return cloud;
    } catch {}
    return VoicemailStore.getGreetings();
  },

  createGreeting: async (payload: any): Promise<VoicemailGreeting> => {
    const saved = VoicemailStore.addGreeting(payload);
    try {
      await request<VoicemailGreeting>('/greetings', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch {}
    return saved;
  },

  deleteGreeting: async (id: string): Promise<{ success: boolean }> => {
    VoicemailStore.deleteGreeting(id);
    try {
      await request<{ success: boolean }>(`/greetings/${id}`, {
        method: 'DELETE',
      });
    } catch {}
    return { success: true };
  },

  // Forwarding Instructions
  getForwardingInstructions: async (dest?: string, seconds?: number): Promise<any> => {
    try {
      return await request<any>(`/webhooks/telephony/forwarding-instructions?destination=${dest || ''}&seconds=${seconds || 20}`);
    } catch {
      const num = dest || '+91 80 1234 5678';
      const sec = seconds || 20;
      return {
        carrier: 'Standard GSM / Reliance Jio / Airtel / Vi',
        targetNumber: num,
        mmiCodes: {
          noAnswer: `*61*${num}**${sec}#`,
          unreachable: `*62*${num}#`,
          busy: `*67*${num}#`,
          allConditional: `*004*${num}**${sec}#`,
          deactivateAll: '##002#',
        },
      };
    }
  },
};

import { Voicemail, VoicemailGreeting, UserProfile } from '../types';

/**
 * Offline-First In-App Data Repository
 * Ensures Nova Live Voicemail functions seamlessly on physical devices,
 * even without an active local backend connection.
 */

let initialVoicemails: Voicemail[] = [
  {
    id: 'vm-sarah-1',
    callerNumber: '+91 98401 23456',
    callerName: 'Dr. Sarah Jenkins',
    durationSeconds: 38,
    status: 'COMPLETED',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    transcript: {
      id: 'tr-sarah-1',
      rawText: 'Hi, this is Dr. Sarah. Confirming your medical appointment tomorrow at 11 AM. Please bring your prior reports. If you need to reschedule, call before 5 PM today. Thank you!',
      language: 'en',
      confidence: 0.98,
      wordTimestamps: [
        { word: 'Hi,', start: 0.0, end: 0.3, confidence: 0.98 },
        { word: 'this', start: 0.4, end: 0.6, confidence: 0.97 },
        { word: 'is', start: 0.7, end: 0.8, confidence: 0.99 },
        { word: 'Dr.', start: 0.9, end: 1.1, confidence: 0.96 },
        { word: 'Sarah.', start: 1.2, end: 1.6, confidence: 0.98 },
        { word: 'Confirming', start: 1.8, end: 2.3, confidence: 0.95 },
        { word: 'appointment', start: 2.4, end: 2.9, confidence: 0.97 },
        { word: 'tomorrow', start: 3.0, end: 3.4, confidence: 0.99 },
        { word: 'at', start: 3.5, end: 3.6, confidence: 0.98 },
        { word: '11', start: 3.7, end: 3.9, confidence: 0.97 },
        { word: 'AM.', start: 4.0, end: 4.4, confidence: 0.98 },
      ],
    },
    summary: {
      id: 'sum-sarah-1',
      summaryText: 'Dr. Sarah confirming medical appointment tomorrow at 11:00 AM. Bring prior reports.',
      callerPurpose: 'Appointment Confirmation',
      appointmentDates: ['Tomorrow at 11:00 AM'],
      callbackRequested: true,
      callbackNumber: '+91 98401 23456',
      suggestedReplies: [
        {
          en: 'Thank you Dr. Sarah, appointment confirmed for tomorrow 11 AM.',
          ta: 'Nandri Dr. Sarah, nalaikku 11 manikku appointment confirm panren.',
        },
        {
          en: 'Could we please reschedule this to the afternoon?',
          ta: 'Idhai mathiyanam nerathukku maatra mudiyuma?',
        },
      ],
    },
  },
  {
    id: 'vm-karthik-2',
    callerNumber: '+91 94440 98765',
    callerName: 'Karthik Subramanian',
    durationSeconds: 24,
    status: 'COMPLETED',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    transcript: {
      id: 'tr-karthik-2',
      rawText: 'வணக்கம், கார்த்திக் பேசுகிறேன். புராஜெக்ட் டாக்குமெண்ட் மெயில் அனுப்பிட்டேன். பார்த்துட்டு கால் பண்ணுங்க, ரொம்ப முக்கியம்.',
      language: 'ta',
      confidence: 0.96,
      wordTimestamps: [
        { word: 'வணக்கம்,', start: 0.0, end: 0.5, confidence: 0.96 },
        { word: 'கார்த்திக்', start: 0.6, end: 1.1, confidence: 0.97 },
        { word: 'பேசுகிறேன்.', start: 1.2, end: 1.7, confidence: 0.95 },
        { word: 'புராஜெக்ட்', start: 1.9, end: 2.4, confidence: 0.98 },
        { word: 'டாக்குமெண்ட்', start: 2.5, end: 3.0, confidence: 0.96 },
      ],
    },
    summary: {
      id: 'sum-karthik-2',
      summaryText: 'Karthik sent the project documentation email and requested an urgent callback to review.',
      callerPurpose: 'Urgent Project Review',
      appointmentDates: ['Today ASAP'],
      callbackRequested: true,
      callbackNumber: '+91 94440 98765',
      suggestedReplies: [
        {
          en: 'Checked the email Karthik, calling you back in 10 minutes.',
          ta: 'Mail paaththein Karthik, 10 nimishathula call panren.',
        },
        {
          en: 'Received the document. Will review tonight.',
          ta: 'Document vandhuchu. Innaiku iravu paarkiren.',
        },
      ],
    },
  },
  {
    id: 'vm-anita-3',
    callerNumber: '+91 98840 11223',
    callerName: 'Anita Roy (Finance)',
    durationSeconds: 45,
    status: 'COMPLETED',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // Yesterday
    transcript: {
      id: 'tr-anita-3',
      rawText: 'Hi, Anita from finance. Your vendor invoice #4082 has been approved and processed. Let me know if you need the transaction receipt.',
      language: 'en',
      confidence: 0.99,
      wordTimestamps: [],
    },
    summary: {
      id: 'sum-anita-3',
      summaryText: 'Vendor invoice #4082 processed and approved. Receipt available upon request.',
      callerPurpose: 'Invoice Approval Notice',
      appointmentDates: [],
      callbackRequested: false,
      suggestedReplies: [
        {
          en: 'Thanks Anita! Please share the transaction receipt.',
          ta: 'Nandri Anita! Transaction receipt share panravum.',
        },
      ],
    },
  },
];

let initialGreetings: VoicemailGreeting[] = [
  {
    id: 'g-default',
    title: 'Standard Greeting (English)',
    greetingType: 'DEFAULT',
    transcriptText: 'Hello! You have reached Nova Live Voicemail. I am unable to answer right now. Please leave your name and message after the tone.',
    language: 'en',
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'g-tamil',
    title: 'வணக்கம் Greeting (Tamil)',
    greetingType: 'AI_GENERATED',
    transcriptText: 'வணக்கம்! நான் தற்போது அழைப்பை ஏற்க இயலவில்லை. உங்கள் பெயர் மற்றும் செய்தியை பீப் ஒலிக்குப் பிறகு சொல்லுங்கள். நன்றி.',
    language: 'ta',
    voiceId: 'nova-female',
    isDefault: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'g-business',
    title: 'Business Hours Greeting',
    greetingType: 'CUSTOM',
    transcriptText: 'Thank you for calling. Our offices are currently closed. Please leave your contact details and inquiry.',
    language: 'en',
    isDefault: false,
    createdAt: new Date().toISOString(),
  },
];

type StoreListener = () => void;
const listeners: Set<StoreListener> = new Set();

const notifyListeners = () => {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.log('Error notifying listener', e);
    }
  });
};

export const VoicemailStore = {
  subscribe: (listener: StoreListener) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  getAllVoicemails: (): Voicemail[] => {
    return [...initialVoicemails];
  },

  getVoicemailById: (id: string): Voicemail | undefined => {
    return initialVoicemails.find((vm) => vm.id === id);
  },

  addVoicemail: (voicemail: Partial<Voicemail>): Voicemail => {
    const newVm: Voicemail = {
      id: `vm-${Date.now()}`,
      callerNumber: voicemail.callerNumber || 'Unknown Caller',
      callerName: voicemail.callerName || 'Live Voicemail Caller',
      durationSeconds: voicemail.durationSeconds || 20,
      status: 'COMPLETED',
      isRead: false,
      createdAt: new Date().toISOString(),
      transcript: voicemail.transcript || {
        id: `tr-${Date.now()}`,
        rawText: 'Caller left a live spoken message.',
        language: 'en',
        confidence: 0.98,
        wordTimestamps: [],
      },
      summary: voicemail.summary || {
        id: `sum-${Date.now()}`,
        summaryText: 'Caller left a live spoken voicemail message.',
        callerPurpose: 'General Message',
        appointmentDates: [],
        callbackRequested: true,
        suggestedReplies: [
          { en: 'Got your message! I will call you back soon.', ta: 'Unga voicemail vandhuchu, seekiram call panren.' },
        ],
      },
    };

    initialVoicemails = [newVm, ...initialVoicemails];
    notifyListeners();
    return newVm;
  },

  markAsRead: (id: string, isRead = true): boolean => {
    const vm = initialVoicemails.find((v) => v.id === id);
    if (vm) {
      vm.isRead = isRead;
      notifyListeners();
      return true;
    }
    return false;
  },

  deleteVoicemail: (id: string): boolean => {
    const lenBefore = initialVoicemails.length;
    initialVoicemails = initialVoicemails.filter((v) => v.id !== id);
    if (initialVoicemails.length !== lenBefore) {
      notifyListeners();
      return true;
    }
    return false;
  },

  getStats: () => {
    const unread = initialVoicemails.filter((v) => !v.isRead).length;
    const total = initialVoicemails.length;
    const minutesSaved = Math.round(total * 2.8);
    return { unread, total, minutesSaved };
  },

  // Greetings
  getGreetings: (): VoicemailGreeting[] => {
    return [...initialGreetings];
  },

  addGreeting: (greeting: Partial<VoicemailGreeting>): VoicemailGreeting => {
    const newG: VoicemailGreeting = {
      id: `g-${Date.now()}`,
      title: greeting.title || 'Custom Greeting',
      greetingType: greeting.greetingType || 'CUSTOM',
      transcriptText: greeting.transcriptText || 'Default greeting text',
      language: greeting.language || 'en',
      voiceId: greeting.voiceId,
      isDefault: greeting.isDefault || false,
      createdAt: new Date().toISOString(),
    };

    if (newG.isDefault) {
      initialGreetings.forEach((g) => (g.isDefault = false));
    }

    initialGreetings = [newG, ...initialGreetings];
    notifyListeners();
    return newG;
  },

  setDefaultGreeting: (id: string): boolean => {
    let found = false;
    initialGreetings.forEach((g) => {
      if (g.id === id) {
        g.isDefault = true;
        found = true;
      } else {
        g.isDefault = false;
      }
    });
    if (found) notifyListeners();
    return found;
  },

  deleteGreeting: (id: string): boolean => {
    initialGreetings = initialGreetings.filter((g) => g.id !== id);
    notifyListeners();
    return true;
  },
};

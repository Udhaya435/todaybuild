import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

const { NovaTelephonyModule } = NativeModules;

const isAndroid = Platform.OS === 'android';
const hasNativeModule = isAndroid && !!NovaTelephonyModule;

let eventEmitter: NativeEventEmitter | null = null;
try {
  if (hasNativeModule) {
    eventEmitter = new NativeEventEmitter(NovaTelephonyModule);
  }
} catch (e) {
  eventEmitter = null;
}

export interface IncomingCallEvent {
  phoneNumber: string;
  displayName: string;
  timestamp: number;
}

export const TelephonyBridge = {
  /**
   * Start native on-device live speech recognition
   */
  startLiveSpeechRecognition: async (language = 'en-US'): Promise<boolean> => {
    if (!hasNativeModule || !NovaTelephonyModule.startLiveSpeechRecognition) {
      console.log('[TelephonyBridge] Speech recognizer simulated in dev mode');
      return true;
    }
    return NovaTelephonyModule.startLiveSpeechRecognition(language);
  },

  /**
   * Stop native on-device live speech recognition
   */
  stopLiveSpeechRecognition: async (): Promise<boolean> => {
    if (!hasNativeModule || !NovaTelephonyModule.stopLiveSpeechRecognition) {
      return true;
    }
    return NovaTelephonyModule.stopLiveSpeechRecognition();
  },

  /**
   * Listen to partial speech recognition results (progressive live text)
   */
  onSpeechPartialResult: (callback: (data: { text: string }) => void) => {
    if (!eventEmitter) return () => {};
    const sub = eventEmitter.addListener('onSpeechPartialResult', callback);
    return () => sub.remove();
  },

  /**
   * Listen to final speech recognition results
   */
  onSpeechFinalResult: (callback: (data: { text: string }) => void) => {
    if (!eventEmitter) return () => {};
    const sub = eventEmitter.addListener('onSpeechFinalResult', callback);
    return () => sub.remove();
  },

  /**
   * Listen to real microphone volume level to drive audio waveforms
   */
  onSpeechVolume: (callback: (data: { rmsdB: number }) => void) => {
    if (!eventEmitter) return () => {};
    const sub = eventEmitter.addListener('onSpeechVolume', callback);
    return () => sub.remove();
  },

  /**
   * Request Android Call Screening Role (RoleManager.ROLE_CALL_SCREENING)
   */
  requestCallScreeningRole: async (): Promise<boolean> => {
    if (!hasNativeModule) return true;
    return NovaTelephonyModule.requestCallScreeningRole();
  },

  /**
   * Request Default Dialer Role (RoleManager.ROLE_DIALER)
   */
  requestDefaultDialerRole: async (): Promise<boolean> => {
    if (!hasNativeModule) return true;
    return NovaTelephonyModule.requestDefaultDialerRole();
  },

  /**
   * Check if Call Screening role is currently held
   */
  isCallScreeningActive: async (): Promise<boolean> => {
    if (!hasNativeModule) return true;
    return NovaTelephonyModule.isCallScreeningRoleHeld();
  },

  /**
   * Check if Default Dialer role is currently held
   */
  isDefaultDialerActive: async (): Promise<boolean> => {
    if (!hasNativeModule) return false;
    return NovaTelephonyModule.isDefaultDialerHeld();
  },

  /**
   * Activate carrier conditional call forwarding using standard MMI code
   */
  activateCarrierForwarding: async (type: string, targetNumber: string, ringSeconds = 20): Promise<{ success: boolean; mmiCode: string }> => {
    if (!hasNativeModule) {
      return { success: true, mmiCode: `*61*${targetNumber}**${ringSeconds}#` };
    }
    return NovaTelephonyModule.activateCarrierForwarding(type, targetNumber, ringSeconds);
  },

  /**
   * Disable carrier call forwarding (##002#)
   */
  disableCarrierForwarding: async (): Promise<{ success: boolean; mmiCode: string }> => {
    if (!hasNativeModule) {
      return { success: true, mmiCode: '##002#' };
    }
    return NovaTelephonyModule.disableCarrierForwarding();
  },

  /**
   * Configure silence unknown callers rule in CallScreeningService
   */
  setSilenceUnknownCallers: (silence: boolean) => {
    if (hasNativeModule) {
      NovaTelephonyModule.setSilenceUnknownCallers(silence);
    }
  },

  /**
   * Speak AI Voice announcement using on-device TextToSpeech
   */
  speakAIAnnouncement: async (text: string): Promise<boolean> => {
    if (!hasNativeModule || !NovaTelephonyModule.speakAIAnnouncement) {
      console.log('[TelephonyBridge] Simulated TTS speech:', text);
      return true;
    }
    return NovaTelephonyModule.speakAIAnnouncement(text);
  },

  /**
   * Set Auto-Answer configuration on last ring
   */
  setAutoAnswerConfig: async (
    enabled: boolean,
    ringSeconds = 15,
    ownerName = 'Udhaya',
    customMessage = ''
  ): Promise<any> => {
    if (!hasNativeModule || !NovaTelephonyModule.setAutoAnswerConfig) {
      return { enabled, ringSeconds, ownerName, message: customMessage };
    }
    return NovaTelephonyModule.setAutoAnswerConfig(enabled, ringSeconds, ownerName, customMessage);
  },

  /**
   * Get Auto-Answer configuration
   */
  getAutoAnswerConfig: async (): Promise<{ enabled: boolean; ringSeconds: number; ownerName: string; message: string }> => {
    if (!hasNativeModule || !NovaTelephonyModule.getAutoAnswerConfig) {
      return {
        enabled: true,
        ringSeconds: 15,
        ownerName: 'Udhaya',
        message: 'Hello! Udhaya is busy right now. Please call back later, or leave your message after the tone.',
      };
    }
    return NovaTelephonyModule.getAutoAnswerConfig();
  },

  /**
   * Answer current ringing call
   */
  answerCall: async (): Promise<boolean> => {
    if (!hasNativeModule || !NovaTelephonyModule.answerCall) return true;
    return NovaTelephonyModule.answerCall();
  },

  /**
   * End / Hang up current active call
   */
  endCall: async (): Promise<boolean> => {
    if (!hasNativeModule || !NovaTelephonyModule.endCall) return true;
    return NovaTelephonyModule.endCall();
  },

  /**
   * Listen for auto-answered call event
   */
  onCallAutoAnswered: (callback: (data: { phoneNumber: string; autoAnswered: boolean }) => void) => {
    if (!eventEmitter) return () => {};
    const subscription = eventEmitter.addListener('onCallAutoAnswered', callback);
    return () => subscription.remove();
  },

  /**
   * Get initial call details if the app was opened via incoming call notification
   */
  getInitialCallDetails: async (): Promise<{ screen: string; callerNumber: string; callerName: string }> => {
    if (!hasNativeModule || !NovaTelephonyModule.getInitialCallDetails) {
      return { screen: '', callerNumber: '', callerName: '' };
    }
    return NovaTelephonyModule.getInitialCallDetails();
  },

  /**
   * Subscribe to incoming call events detected by CallScreeningService / InCallService
   */
  onIncomingCall: (callback: (event: IncomingCallEvent) => void) => {
    if (!eventEmitter) return () => {};
    const subscription = eventEmitter.addListener('onIncomingCall', callback);
    return () => subscription.remove();
  }
};

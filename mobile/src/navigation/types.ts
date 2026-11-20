export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  PermissionSetup: undefined;
  Dashboard: undefined;
  VoicemailInbox: undefined;
  LiveVoicemail: { callerName?: string; callerNumber?: string; voicemailId?: string };
  VoicemailDetail: { voicemailId: string };
  AudioPlayer: { callerName?: string; callerNumber?: string; duration?: number };
  AISummary: { voicemailId: string };
  GreetingManagement: undefined;
  CallSettings: undefined;
  ForwardingConfig: undefined;
  Contacts: undefined;
  Notifications: undefined;
  Profile: undefined;
  AppSettings: undefined;
};

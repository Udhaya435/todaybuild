# NOVA LIVE VOICEMAIL

**Apple Live Voicemail inspired Android Application & Intelligent Cloud Telephony Backend.**

See speech transcription in real-time as callers speak. Listen to recorded messages, read zero-hallucination AI summaries, and generate instant replies in English and Tamil.

---

## ⚡ Key Highlights

- **Real-Time Live Voicemail**: Progressive speech-to-text updates on screen as callers speak, complete with animated audio waveform.
- **Strict Android Security Compliance**: Respects Android's cellular audio restrictions by using carrier-supported call forwarding (`*61*`, `*67*`) to a secure virtual voicemail gateway.
- **Native Android Telecom Integration**: Kotlin modules implementing `CallScreeningService`, `RoleManager.ROLE_CALL_SCREENING`, and optional `InCallService`.
- **Zero-Hallucination AI Intelligence**: Automatic purpose identification, deadline/date extraction, and dual-language (English + Tamil/Tanglish) suggested replies powered by OpenAI.
- **Synchronized Audio Player**: Word-by-word highlighted transcripts synced with audio playback, with 1x, 1.5x, and 2x speed controls.
- **Custom Greetings**: Multi-lingual voicemail greetings in English, Tamil, and Tanglish via custom recording or AI Neural TTS.

---

## 🏗️ Architecture & Project Layout

```
nova-live-voicemail/
├── backend/                  # Node.js + Express + Prisma + PostgreSQL + WebSockets
│   ├── prisma/
│   │   └── schema.prisma     # 9 Prisma models (User, Voicemail, Transcript, Summary, etc.)
│   ├── src/
│   │   ├── config/           # Environment configuration
│   │   ├── database/         # Prisma client initialization
│   │   ├── middleware/       # JWT auth & Telephony webhook signature verification
│   │   ├── routes/           # Auth, Voicemail, AI, Greetings, Telephony webhooks
│   │   ├── services/         # AI analysis, Whisper STT, TTS, Twilio TwiML, WebSockets
│   │   └── server.ts         # Main server entry with real-time WebSocket broadcasting
│   └── package.json
│
├── mobile/                   # React Native + TypeScript + Native Kotlin Android
│   ├── android/              # Native Android project
│   │   └── app/src/main/
│   │       ├── AndroidManifest.xml # Declares CallScreeningService, InCallService & permissions
│   │       └── java/com/novalive/voicemail/
│   │           ├── telecom/
│   │           │   ├── NovaCallScreeningService.kt # Android Telecom Call Screening
│   │           │   ├── NovaInCallService.kt        # Default Dialer & Active Call manager
│   │           │   ├── CarrierForwardingHelper.kt  # Generates MMI codes (*61*, *67*, ##002#)
│   │           │   └── CallStateTracker.kt
│   │           └── modules/
│   │               ├── NovaTelephonyModule.kt      # React Native Bridge module
│   │               └── NovaTelephonyPackage.kt
│   └── src/
│       ├── theme/colors.ts   # Apple-inspired Dark (#0B0D12) and Light theme system
│       ├── navigation/       # Type-safe React Navigation stack
│       ├── components/       # WaveformVisualizer, VoicemailCard, AudioControlBar, TranscriptViewer
│       ├── services/         # REST API client, WebSocket stream client, TelephonyBridge
│       └── screens/          # 16 Complete Application Screens:
│           ├── SplashScreen.tsx
│           ├── OnboardingScreen.tsx
│           ├── PermissionSetupScreen.tsx
│           ├── DashboardScreen.tsx
│           ├── VoicemailInboxScreen.tsx
│           ├── LiveVoicemailScreen.tsx        (Flagship Real-time Live Screen)
│           ├── VoicemailDetailScreen.tsx      (Word-level timestamps & audio sync)
│           ├── AudioPlayerScreen.tsx          (Scrubbing, 1x/1.5x/2x speed controls)
│           ├── AISummaryScreen.tsx            (Purpose, appointments, Tamil/English replies)
│           ├── GreetingManagementScreen.tsx   (Record, upload, AI Voice TTS generation)
│           ├── CallSettingsScreen.tsx         (Silence unknown callers, ring timeout)
│           ├── ForwardingConfigScreen.tsx     (Carrier MMI activation *61*, *67*)
│           ├── ContactsScreen.tsx             (VIP callers & whitelisting)
│           ├── NotificationsScreen.tsx        (Voicemail alert logs)
│           ├── ProfileScreen.tsx              (Virtual number, cloud quota)
│           └── AppSettingsScreen.tsx          (Theme, audio quality, privacy disclosure)
│
└── docs/                     # Detailed technical documentation
    ├── ARCHITECTURE.md
    ├── CARRIER_FORWARDING_GUIDE.md
    ├── TELEPHONY_PROVIDER_SETUP.md
    ├── ANDROID_PERMISSIONS_GUIDE.md
    ├── BUILD_AND_SIGNING_GUIDE.md
    └── API_REFERENCE.md
```

---

## 🚀 Running the Project

### 1. Start Backend Server
```bash
cd nova-live-voicemail/backend
npm install
# Set environment variables in .env (see .env.example)
npm run prisma:generate
npm run dev
```
The server will start at `http://localhost:5000` with WebSockets active on `ws://localhost:5000/ws`.

### 2. Start Mobile App
```bash
cd nova-live-voicemail/mobile
npm install
npm run android
```

### 3. Testing the Live Voicemail Experience
- Open the application on your Android emulator or physical device.
- On the **Dashboard**, tap **"Test Live Voicemail Demo"** to see real-time progressive transcript streaming and animated audio waveforms in action.
- Navigate to **"Carrier MMI Setup"** to dial standard conditional forwarding codes (`*61*`, `*67*`) for your cellular carrier.

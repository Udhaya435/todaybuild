# Nova Live Voicemail - System Architecture

```mermaid
flowchart TD
    subgraph CarrierNetwork["Cellular Carrier Network (Airtel / Jio / AT&T / Verizon)"]
        Caller["Caller Dials User's Phone"] --> UserPhone["User Android Phone"]
        UserPhone -- "Unanswered / Declined (*61* / *67*)" --> CarrierForward["Carrier Forwarding"]
    end

    subgraph AndroidDevice["Android Native App (Kotlin + React Native)"]
        UserPhone -.-> NovaScreening["NovaCallScreeningService (Telecom Framework)"]
        NovaScreening --> RoleManager["RoleManager.ROLE_CALL_SCREENING"]
        NovaScreening --> CallStateTracker["CallStateTracker"]
        CallStateTracker --> NovaTelephonyBridge["NovaTelephonyModule (JNI Bridge)"]
        NovaTelephonyBridge --> RNApp["React Native UI (16 Screens)"]
        RNApp --> LiveVMScreen["Live Voicemail Screen (Progressive Transcript + Waveform)"]
    end

    subgraph CloudTelephony["Cloud Telephony / SIP (Twilio / Telnyx)"]
        CarrierForward --> VirtualNumber["Assigned Virtual Voicemail Line"]
        VirtualNumber --> InboundWebhook["POST /api/webhooks/telephony/incoming"]
    end

    subgraph BackendSystem["Nova Backend (Node.js + Express + Prisma + Postgres)"]
        InboundWebhook --> TwiMLGenerator["TelephonyService (Play Greeting & Record)"]
        TwiMLGenerator --> WebSocketServer["WebSocket Service (/ws)"]
        WebSocketServer -- "Live Inbound Alert" --> RNApp

        RecordCallback["POST /api/webhooks/telephony/recording"] --> STTEngine["TranscriptionService (Whisper / Deepgram)"]
        STTEngine --> WordTimestamps["Word-level Timestamps Engine"]
        WordTimestamps --> AIEngine["AIService (GPT-4o-mini / Nova AI)"]
        AIEngine --> FactualSummary["Factual Summary + Purpose + Dates"]
        AIEngine --> SmartReplies["English & Tamil Smart Replies"]
        SmartReplies --> PostgresDB[("PostgreSQL DB (Prisma ORM)")]
        PostgresDB --> PushNotification["Push / WebSocket Broadcast"]
        PushNotification --> RNApp
    end
```

## Architectural Decoupling & Security Boundaries

### 1. Cellular Call Audio vs Local App Sandboxing
- Android's security architecture prevents non-system third-party applications from reading cellular telephone call audio directly via local microphone APIs.
- Nova follows strict standard platform specifications:
  - **Incoming Call Detection**: Handled by Android's `CallScreeningService` within system timeouts (~5 seconds).
  - **Audio Recording**: Handled by carrier-level conditional call forwarding (`*61*`, `*67*`, `*62*`) to an authorized cloud telephony gateway (Twilio / Telnyx / FreeSWITCH).
  - **Live Voicemail Feed**: The cloud telephony service streams audio or transcription events in real-time over secure WebSockets (`/ws`) directly to the mobile application.

### 2. Zero-Hallucination AI Architecture
- Voicemail summaries are generated using a factual prompt architecture:
  - Strict prohibition against inventing dates, names, or phone numbers.
  - Generates bidirectional smart replies in both English and Tamil/Tanglish.
  - Word-level timestamps enable synchronized visual transcript highlighting during playback.

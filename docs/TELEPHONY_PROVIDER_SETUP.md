# Telephony Provider Setup (Twilio / Telnyx / SIP)

Nova Live Voicemail includes full webhook endpoints and TwiML generators to support any cloud telephony or SIP provider.

## 1. Twilio Configuration

### Buy or Assign a Phone Number
1. In the Twilio Console, acquire an SMS/Voice-enabled phone number.
2. Set this number as `TWILIO_PHONE_NUMBER` in your backend `.env`.

### Webhook Configuration
Under Phone Numbers -> Active Numbers -> Configure:
- **A CALL COMES IN**: `Webhook`
- **URL**: `https://<YOUR_DOMAIN>/api/webhooks/telephony/incoming`
- **HTTP METHOD**: `POST`
- **CALL STATUS CHANGES**: `https://<YOUR_DOMAIN>/api/webhooks/telephony/status`

### Webhook Signature Verification
For production, set `TWILIO_AUTH_TOKEN` and `TWILIO_WEBHOOK_SECRET` in `.env`.
Nova verifies the incoming `x-twilio-signature` HMAC header to block spoofed requests.

## 2. Inbound Call Flow
1. Caller calls user's phone number.
2. User declines or misses the call.
3. Carrier forwards call to the Twilio virtual line.
4. Twilio hits `/api/webhooks/telephony/incoming`.
5. Nova generates TwiML:
   - Emits a WebSocket alert to the mobile device to show `LiveVoicemailScreen`.
   - Plays customized greeting (or AI TTS generated audio in English/Tamil).
   - Starts recording with `<Record recordingStatusCallback="/api/webhooks/telephony/recording" transcribe="true"/>`.
6. When recording ends, `/api/webhooks/telephony/recording` executes Whisper transcription and GPT-4o-mini summarization, pushing results directly to Prisma and the mobile app.

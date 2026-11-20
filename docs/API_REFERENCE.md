# Nova Live Voicemail - Backend API Reference

Base URL: `http://localhost:5000/api`

## Authentication
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/auth/register` | Register new user account with phone number |
| `POST` | `/auth/login` | Login with email or phone number + password |
| `GET` | `/auth/profile` | Retrieve authenticated profile and voicemail number |

## Voicemail Management
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/voicemails` | List voicemails (Query: `unreadOnly`, `search`, `sort`) |
| `GET` | `/voicemails/:id` | Get single voicemail with transcript, timestamps & summary |
| `PATCH`| `/voicemails/:id/read` | Mark message as read/unread |
| `DELETE`| `/voicemails/:id` | Delete voicemail record and audio permanently |
| `POST` | `/voicemails` | Create test voicemail for end-to-end simulation |

## AI & Intelligence
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/ai/summarize` | Generate factual summary, purpose & dates from transcript |
| `POST` | `/ai/suggest-reply` | Generate bidirectional smart replies (English & Tamil) |
| `POST` | `/ai/search` | Natural language semantic intent search across voicemails |

## Custom Greetings
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/greetings` | List all custom and default greetings |
| `POST` | `/greetings` | Create greeting (Audio upload or AI TTS in English/Tamil) |
| `PUT` | `/greetings/:id` | Update greeting details or mark as active default |
| `DELETE`| `/greetings/:id` | Delete greeting record |

## Telephony Webhooks
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/webhooks/telephony/incoming` | Inbound carrier forwarding hook; returns greeting TwiML |
| `POST` | `/webhooks/telephony/recording` | Triggers Whisper transcription & GPT-4o-mini summarizer |
| `POST` | `/webhooks/telephony/status` | In-flight telephony status changes |
| `GET` | `/webhooks/telephony/forwarding-instructions` | Carrier MMI code helper generator |

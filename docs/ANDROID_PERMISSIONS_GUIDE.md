# Android Permissions & Roles Guide

Nova integrates with Android Telecom framework through official APIs:

## Required Android Permissions

| Permission | Reason for Request |
| :--- | :--- |
| `android.permission.INTERNET` | Communicates with the Nova backend API and WebSocket stream. |
| `android.permission.READ_PHONE_STATE` | Monitors incoming call state and phone connection status. |
| `android.permission.CALL_PHONE` | Enables one-tap carrier MMI code dialing (*61*, *67*). |
| `android.permission.READ_CONTACTS` | Resolves caller phone numbers to real contact names and photos. |
| `android.permission.RECORD_AUDIO` | Enables user to record their own customized voicemail greeting. |
| `android.permission.POST_NOTIFICATIONS` | Alerts user when live transcription is active or voicemail is saved. |

## Telecom Framework Roles

### 1. `RoleManager.ROLE_CALL_SCREENING`
- Requested via `NovaTelephonyModule.requestCallScreeningRole()`.
- Binds `NovaCallScreeningService` with `android.permission.BIND_SCREENING_SERVICE`.
- Enables Nova to identify incoming callers and apply silence/screening rules within Android's mandatory screening timeout.

### 2. `RoleManager.ROLE_DIALER` (Optional)
- Requested via `NovaTelephonyModule.requestDefaultDialerRole()`.
- Binds `NovaInCallService` with `android.permission.BIND_INCALL_SERVICE`.
- Required only if the user wants Nova to serve as the default dialer.

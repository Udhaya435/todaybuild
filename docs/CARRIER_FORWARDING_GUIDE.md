# Carrier Call Forwarding & MMI Code Guide

Nova Live Voicemail leverages standard 3GPP GSM Supplementary Service MMI codes supported by global telecom operators (Airtel, Jio, Vodafone-Idea, AT&T, T-Mobile, Verizon).

## Supported MMI Codes

| Forwarding Scenario | MMI Code Syntax | Description |
| :--- | :--- | :--- |
| **No Answer (Timeout)** | `*61*<Voicemail_Number>**<Seconds>#` | Forwards if phone rings for `<Seconds>` (default: 20s) without answer. |
| **Busy / Declined** | `*67*<Voicemail_Number>#` | Forwards immediately when you tap "Decline" or when on another call. |
| **Unreachable / Off** | `*62*<Voicemail_Number>#` | Forwards when phone is powered off or in airplane mode. |
| **All Conditional** | `**004*<Voicemail_Number>*11*<Seconds>#` | Activates all three conditional forwarding rules at once. |
| **Check Status** | `*#004#` or `*#61#` | Displays current active carrier forwarding destination. |
| **Restore / Disable All** | `##002#` | Cancels all forwarding and restores standard carrier voicemail. |

## Android Implementation Details

In Android, dialing MMI codes containing `#` via `Intent.ACTION_DIAL` requires URL encoding:
```kotlin
val encodedHash = mmiCode.replace("#", Uri.encode("#")) // turns '#' into '%23'
val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:$encodedHash"))
context.startActivity(intent)
```
Nova's `CarrierForwardingHelper.kt` automatically handles this encoding to ensure clean one-tap activation from the app.

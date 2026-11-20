package com.novalive.voicemail.telecom

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.telecom.Call
import android.telecom.CallScreeningService
import android.util.Log
import androidx.annotation.RequiresApi
import androidx.core.app.NotificationCompat
import com.novalive.voicemail.MainActivity

/**
 * NovaCallScreeningService
 * 
 * Implements Android Telecom's official CallScreeningService.
 * CRITICAL ARCHITECTURAL CONSTRAINTS:
 * - Operates strictly within Android's mandatory screening timeout (~5 seconds).
 * - Identifies caller information via Call.Details.
 * - Posts high-priority Notification so the user can instantly open Live Voicemail.
 * - Routes call decision: allow normally or silently drop spam per user configuration.
 */
@RequiresApi(Build.VERSION_CODES.Q)
class NovaCallScreeningService : CallScreeningService() {

    companion object {
        private const val TAG = "NovaCallScreening"
        private const val CHANNEL_ID = "nova_live_voicemail_channel"
        private const val NOTIFICATION_ID = 2001
    }

    override fun onScreenCall(callDetails: Call.Details) {
        val handle = callDetails.handle
        val rawPhoneNumber = handle?.schemeSpecificPart ?: "Unknown Caller"
        val callerDisplayName = callDetails.callerDisplayName ?: rawPhoneNumber

        Log.i(TAG, "Screening incoming call from $rawPhoneNumber ($callerDisplayName)")

        // 1. Notify app in-memory tracker (notifies foreground React Native screen if open)
        CallStateTracker.onCallReceived(rawPhoneNumber, callerDisplayName)

        // 2. Post High-Priority Notification so user can open Live Voicemail transcription screen
        showLiveVoicemailNotification(rawPhoneNumber, callerDisplayName)

        // 3. Determine screening response
        val responseBuilder = CallResponse.Builder()
        val shouldSilence = CallStateTracker.shouldSilenceUnknown() && rawPhoneNumber == "Unknown Caller"

        if (shouldSilence) {
            responseBuilder
                .setDisallowCall(false)
                .setRejectCall(false)
                .setSilenceCall(true)
                .setSkipCallLog(false)
                .setSkipNotification(true)
            Log.d(TAG, "Silenced unknown caller per user setting")
        } else {
            responseBuilder
                .setDisallowCall(false)
                .setRejectCall(false)
                .setSilenceCall(false)
                .setSkipCallLog(false)
                .setSkipNotification(false)
        }

        // Must respond before timeout
        respondToCall(callDetails, responseBuilder.build())
    }

    private fun showLiveVoicemailNotification(phoneNumber: String, displayName: String) {
        try {
            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val channel = NotificationChannel(
                    CHANNEL_ID,
                    "Live Voicemail Screening",
                    NotificationManager.IMPORTANCE_HIGH
                ).apply {
                    description = "Alerts for incoming calls with live voicemail transcription"
                    enableVibration(true)
                }
                notificationManager.createNotificationChannel(channel)
            }

            val launchIntent = Intent(this, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
                putExtra("screen", "LiveVoicemail")
                putExtra("callerNumber", phoneNumber)
                putExtra("callerName", displayName)
            }

            val pendingIntent = PendingIntent.getActivity(
                this,
                0,
                launchIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or (if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) PendingIntent.FLAG_IMMUTABLE else 0)
            )

            val notification = NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(android.R.drawable.sym_call_incoming)
                .setContentTitle("📞 Nova Live Voicemail")
                .setContentText("Screening: $displayName ($phoneNumber). Tap for live transcript.")
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setCategory(NotificationCompat.CATEGORY_CALL)
                .setAutoCancel(true)
                .setContentIntent(pendingIntent)
                .build()

            notificationManager.notify(NOTIFICATION_ID, notification)
        } catch (e: Exception) {
            Log.e(TAG, "Error posting live voicemail notification", e)
        }
    }
}

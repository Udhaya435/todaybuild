package com.novalive.voicemail.telecom

import android.content.Context
import android.content.SharedPreferences
import android.media.AudioAttributes
import android.media.AudioManager
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.telecom.TelecomManager
import android.util.Log
import java.util.Locale

/**
 * NovaAutoAnswerHelper
 * 
 * Manages the live cellular call lifecycle:
 * 1. Counts down on incoming ringing call (Last Ring timeout).
 * 2. If unanswered, automatically answers the live phone call.
 * 3. Switches to voice speaker so audio cleanly routes to caller.
 * 4. Speaks: "Hello! Udhaya is busy right now. Please call back later, or leave your message after the tone."
 * 5. Automatically terminates / hangs up the phone call once the announcement completes.
 */
class NovaAutoAnswerHelper(private val context: Context) : TextToSpeech.OnInitListener {

    companion object {
        private const val TAG = "NovaAutoAnswer"
        private const val UTTERANCE_ID = "nova_live_busy_announcement"
        private const val PREFS_NAME = "nova_auto_answer_prefs"

        private const val KEY_ENABLED = "auto_answer_enabled"
        private const val KEY_TIMEOUT = "ring_timeout_seconds"
        private const val KEY_OWNER = "owner_name"
        private const val KEY_MESSAGE = "busy_message"

        val DEFAULT_MESSAGE = "Hello! Udhaya is busy right now. Please call back later, or leave your message after the tone."
    }

    private val prefs: SharedPreferences =
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    private var tts: TextToSpeech? = null
    private var isTtsReady = false
    private val mainHandler = Handler(Looper.getMainLooper())
    private var pendingRunnable: Runnable? = null

    var isAutoAnswerEnabled: Boolean
        get() = prefs.getBoolean(KEY_ENABLED, true)
        set(value) = prefs.edit().putBoolean(KEY_ENABLED, value).apply()

    var ringTimeoutSeconds: Int
        get() = prefs.getInt(KEY_TIMEOUT, 12) // 12 seconds ~ 3-4 rings (last ring)
        set(value) = prefs.edit().putInt(KEY_TIMEOUT, value).apply()

    var ownerName: String
        get() = prefs.getString(KEY_OWNER, "Udhaya") ?: "Udhaya"
        set(value) = prefs.edit().putString(KEY_OWNER, value).apply()

    var busyMessage: String
        get() = prefs.getString(KEY_MESSAGE, DEFAULT_MESSAGE) ?: DEFAULT_MESSAGE
        set(value) = prefs.edit().putString(KEY_MESSAGE, value).apply()

    init {
        mainHandler.post {
            try {
                tts = TextToSpeech(context.applicationContext, this)
            } catch (e: Exception) {
                Log.e(TAG, "Error initializing TextToSpeech", e)
            }
        }
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            val result = tts?.setLanguage(Locale.US)
            if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                Log.w(TAG, "US English voice missing, using default locale")
                tts?.setLanguage(Locale.getDefault())
            }
            tts?.setSpeechRate(0.92f) // Clear, natural cadence
            tts?.setPitch(1.0f)

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                val audioAttributes = AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_VOICE_COMMUNICATION)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                    .build()
                tts?.setAudioAttributes(audioAttributes)
            }

            isTtsReady = true
            Log.i(TAG, "Nova Auto-Answer TTS ready")
        } else {
            Log.e(TAG, "TTS init failed with status: $status")
        }
    }

    /**
     * Triggered when an incoming cellular call starts ringing.
     * Starts countdown to last ring timeout.
     */
    fun onCallRinging(phoneNumber: String, onAnswered: (() -> Unit)? = null) {
        cancelPendingAutoAnswer()

        if (!isAutoAnswerEnabled) {
            Log.d(TAG, "Auto-answer disabled in settings")
            return
        }

        val timeout = ringTimeoutSeconds
        Log.i(TAG, "Call from $phoneNumber ringing. Auto-answering on last ring in $timeout seconds...")

        pendingRunnable = Runnable {
            Log.i(TAG, "Last ring reached ($timeout s)! Answering call automatically now...")
            val answered = answerCallNow()
            onAnswered?.invoke()

            // After answering call, route audio and speak announcement
            mainHandler.postDelayed({
                enableSpeakerphoneForCall()

                speakAnnouncement(busyMessage) {
                    Log.i(TAG, "Announcement finished. Terminating call now as requested...")
                    // Wait 2.5 seconds to let tone/caller hear full message, then hang up
                    mainHandler.postDelayed({
                        endCallNow()
                        Log.i(TAG, "Call successfully ended automatically!")
                    }, 2500)
                }
            }, 800)
        }

        mainHandler.postDelayed(pendingRunnable!!, timeout * 1000L)
    }

    fun cancelPendingAutoAnswer() {
        pendingRunnable?.let {
            mainHandler.removeCallbacks(it)
            pendingRunnable = null
            Log.d(TAG, "Cancelled pending auto-answer timer (user picked up or caller hung up)")
        }
    }

    /**
     * Answers the live phone call using Android Telecom
     */
    fun answerCallNow(): Boolean {
        try {
            // 1. If NovaInCallService has active call
            if (NovaInCallService.activeCall != null) {
                NovaInCallService.activeCall?.answer(0)
                Log.i(TAG, "Call answered via NovaInCallService")
                return true
            }

            // 2. TelecomManager acceptRingingCall (Android 8.0+)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val tm = context.getSystemService(Context.TELECOM_SERVICE) as? TelecomManager
                tm?.acceptRingingCall()
                Log.i(TAG, "Call answered via TelecomManager.acceptRingingCall()")
                return true
            }
        } catch (e: Exception) {
            Log.e(TAG, "Exception while answering call", e)
        }
        return false
    }

    /**
     * Terminates / hangs up the live phone call
     */
    fun endCallNow(): Boolean {
        try {
            // 1. If NovaInCallService is active
            if (NovaInCallService.activeCall != null) {
                NovaInCallService.activeCall?.disconnect()
                Log.i(TAG, "Call disconnected via NovaInCallService")
                return true
            }

            // 2. TelecomManager.endCall() on Android 9+ (API 28+)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                val tm = context.getSystemService(Context.TELECOM_SERVICE) as? TelecomManager
                val ended = tm?.endCall() ?: false
                Log.i(TAG, "Call disconnected via TelecomManager.endCall(): $ended")
                return ended
            }
        } catch (e: Exception) {
            Log.e(TAG, "Exception while ending call", e)
        }
        return false
    }

    private fun enableSpeakerphoneForCall() {
        try {
            val audioManager = context.getSystemService(Context.AUDIO_SERVICE) as? AudioManager
            audioManager?.mode = AudioManager.MODE_IN_COMMUNICATION
            audioManager?.isSpeakerphoneOn = true
            Log.i(TAG, "Speakerphone enabled for clear audio uplink transmission")
        } catch (e: Exception) {
            Log.e(TAG, "Error configuring audio manager", e)
        }
    }

    fun speakAnnouncement(text: String, onComplete: (() -> Unit)? = null) {
        val speechText = if (text.isNotBlank()) text else busyMessage

        mainHandler.post {
            try {
                if (isTtsReady && tts != null) {
                    tts?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
                        override fun onStart(utteranceId: String?) {
                            Log.d(TAG, "AI speech announcement started")
                        }

                        override fun onDone(utteranceId: String?) {
                            Log.d(TAG, "AI speech announcement completed")
                            mainHandler.post { onComplete?.invoke() }
                        }

                        override fun onError(utteranceId: String?) {
                            Log.w(TAG, "AI speech announcement error: $utteranceId")
                            mainHandler.post { onComplete?.invoke() }
                        }
                    })

                    tts?.speak(speechText, TextToSpeech.QUEUE_FLUSH, null, UTTERANCE_ID)
                } else {
                    Log.w(TAG, "TTS not ready yet")
                    onComplete?.invoke()
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error speaking announcement", e)
                onComplete?.invoke()
            }
        }
    }

    fun shutdown() {
        cancelPendingAutoAnswer()
        try {
            tts?.stop()
            tts?.shutdown()
            tts = null
        } catch (e: Exception) {
            Log.e(TAG, "Error shutting down TTS", e)
        }
    }
}

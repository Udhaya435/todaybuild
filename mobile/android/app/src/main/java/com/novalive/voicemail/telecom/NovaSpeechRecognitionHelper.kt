package com.novalive.voicemail.telecom

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.util.Log

/**
 * NovaSpeechRecognitionHelper
 * 
 * Provides continuous on-device live speech-to-text recognition with automatic
 * session recovery on speech pauses/timeouts and real-time audio volume RMS reporting.
 * Supports multi-language recognition (English en-US/en-IN and Tamil ta-IN).
 */
class NovaSpeechRecognitionHelper(
    private val context: Context,
    private val onPartialResult: (String) -> Unit,
    private val onFinalResult: (String) -> Unit,
    private val onRmsChanged: (Float) -> Unit,
    private val onErrorOccurred: (String) -> Unit
) {
    companion object {
        private const val TAG = "NovaSpeech"
    }

    private var speechRecognizer: SpeechRecognizer? = null
    private val mainHandler = Handler(Looper.getMainLooper())
    private var isListening = false
    private var currentLanguage = "en-US"
    private var accumulatedText = ""

    fun startListening(language: String = "en-US") {
        currentLanguage = if (language.isBlank()) "en-US" else language
        accumulatedText = ""
        isListening = true

        mainHandler.post {
            initiateListeningInternal()
        }
    }

    private fun initiateListeningInternal() {
        if (!isListening) return

        try {
            cleanupRecognizer()

            // Create SpeechRecognizer on Main Thread
            speechRecognizer = try {
                SpeechRecognizer.createSpeechRecognizer(context)
            } catch (e: Exception) {
                Log.e(TAG, "Failed to create SpeechRecognizer", e)
                onErrorOccurred("Could not initialize SpeechRecognizer: ${e.message}")
                return
            }

            if (speechRecognizer == null) {
                onErrorOccurred("Speech recognition service is not available on this device")
                return
            }

            speechRecognizer?.setRecognitionListener(object : RecognitionListener {
                override fun onReadyForSpeech(params: Bundle?) {
                    Log.d(TAG, "Ready for speech in language: $currentLanguage")
                }

                override fun onBeginningOfSpeech() {
                    Log.d(TAG, "Speech input started")
                }

                override fun onRmsChanged(rmsdB: Float) {
                    if (isListening) {
                        onRmsChanged(rmsdB)
                    }
                }

                override fun onBufferReceived(buffer: ByteArray?) {}

                override fun onEndOfSpeech() {
                    Log.d(TAG, "Speech input ended")
                }

                override fun onError(error: Int) {
                    Log.w(TAG, "Speech recognition error code: $error")
                    
                    // Automatically resume listening if paused, timed out, or no match while active
                    if (isListening) {
                        when (error) {
                            SpeechRecognizer.ERROR_NO_MATCH,
                            SpeechRecognizer.ERROR_SPEECH_TIMEOUT,
                            SpeechRecognizer.ERROR_CLIENT -> {
                                // Normal pause in speech, restart listening after brief interval
                                mainHandler.postDelayed({
                                    if (isListening) {
                                        initiateListeningInternal()
                                    }
                                }, 250)
                                return
                            }
                            else -> {
                                val errorMsg = when (error) {
                                    SpeechRecognizer.ERROR_AUDIO -> "Audio recording error"
                                    SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS -> "Microphone permission required"
                                    SpeechRecognizer.ERROR_NETWORK -> "Network required for speech engine"
                                    SpeechRecognizer.ERROR_NETWORK_TIMEOUT -> "Network timeout"
                                    SpeechRecognizer.ERROR_RECOGNIZER_BUSY -> "Speech recognizer busy"
                                    SpeechRecognizer.ERROR_SERVER -> "Speech server error"
                                    else -> "Speech recognition error ($error)"
                                }
                                onErrorOccurred(errorMsg)
                                
                                // Retry once if busy
                                if (error == SpeechRecognizer.ERROR_RECOGNIZER_BUSY) {
                                    mainHandler.postDelayed({
                                        if (isListening) initiateListeningInternal()
                                    }, 500)
                                }
                            }
                        }
                    }
                }

                override fun onResults(results: Bundle?) {
                    val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                    val text = matches?.firstOrNull()?.trim() ?: ""
                    
                    if (text.isNotEmpty()) {
                        accumulatedText = if (accumulatedText.isEmpty()) text else "$accumulatedText $text"
                        onFinalResult(accumulatedText)
                    }

                    // Continue listening seamlessly for multi-sentence voicemails
                    if (isListening) {
                        mainHandler.postDelayed({
                            if (isListening) {
                                initiateListeningInternal()
                            }
                        }, 150)
                    }
                }

                override fun onPartialResults(partialResults: Bundle?) {
                    val matches = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                    val partial = matches?.firstOrNull()?.trim() ?: ""
                    
                    if (partial.isNotEmpty() && isListening) {
                        val combined = if (accumulatedText.isEmpty()) partial else "$accumulatedText $partial"
                        onPartialResult(combined)
                    }
                }

                override fun onEvent(eventType: Int, params: Bundle?) {}
            })

            val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                putExtra(RecognizerIntent.EXTRA_LANGUAGE, currentLanguage)
                putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, currentLanguage)
                putExtra(RecognizerIntent.EXTRA_ONLY_RETURN_LANGUAGE_PREFERENCE, currentLanguage)
                putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
                putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 3)
                // Set speech timeout parameters
                putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS, 3000L)
                putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS, 2000L)
            }

            speechRecognizer?.startListening(intent)
        } catch (e: Exception) {
            Log.e(TAG, "Exception starting speech recognition", e)
            onErrorOccurred(e.message ?: "Failed to start speech recognition")
        }
    }

    fun stopListening() {
        isListening = false
        mainHandler.post {
            cleanupRecognizer()
        }
    }

    private fun cleanupRecognizer() {
        try {
            speechRecognizer?.stopListening()
            speechRecognizer?.cancel()
            speechRecognizer?.destroy()
            speechRecognizer = null
        } catch (e: Exception) {
            Log.e(TAG, "Error cleaning up speech recognizer", e)
        }
    }
}

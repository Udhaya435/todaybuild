package com.novalive.voicemail.telecom

object CallStateTracker {
    private var silenceUnknownCallers = false
    var ownerName: String = "Udhaya"
    var isAutoAnswerEnabled: Boolean = true
    var ringTimeoutSeconds: Int = 15
    var busyMessage: String = "Hello! Udhaya is busy right now. Please call back later, or leave your message after the tone."

    private var incomingCallListener: ((phoneNumber: String, displayName: String?) -> Unit)? = null
    private var callAnsweredListener: (() -> Unit)? = null
    private var callEndedListener: (() -> Unit)? = null

    fun setSilenceUnknown(silence: Boolean) {
        silenceUnknownCallers = silence
    }

    fun shouldSilenceUnknown(): Boolean {
        return silenceUnknownCallers
    }

    fun setIncomingCallListener(l: ((phoneNumber: String, displayName: String?) -> Unit)?) {
        this.incomingCallListener = l
    }

    fun setCallAnsweredListener(l: (() -> Unit)?) {
        this.callAnsweredListener = l
    }

    fun setCallEndedListener(l: (() -> Unit)?) {
        this.callEndedListener = l
    }

    fun onCallReceived(phoneNumber: String, displayName: String?) {
        incomingCallListener?.invoke(phoneNumber, displayName)
    }

    fun onCallAnswered() {
        callAnsweredListener?.invoke()
    }

    fun onCallEnded() {
        callEndedListener?.invoke()
    }
}

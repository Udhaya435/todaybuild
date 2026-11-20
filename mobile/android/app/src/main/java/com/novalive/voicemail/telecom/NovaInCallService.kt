package com.novalive.voicemail.telecom

import android.telecom.Call
import android.telecom.InCallService
import android.util.Log

/**
 * NovaInCallService
 * 
 * Bound when Nova is the active Phone / Dialer service.
 * Automatically handles ringing calls on the last ring:
 * 1. Counts down ring timeout.
 * 2. Answers call via call.answer(0).
 * 3. Speaks AI busy message.
 * 4. Hangs up via call.disconnect().
 */
class NovaInCallService : InCallService() {

    companion object {
        private const val TAG = "NovaInCallService"
        var activeCall: Call? = null
        private var autoAnswerHelper: NovaAutoAnswerHelper? = null
    }

    private val callCallback = object : Call.Callback() {
        override fun onStateChanged(call: Call, state: Int) {
            super.onStateChanged(call, state)
            Log.d(TAG, "InCallService Call state changed to $state")
            if (state == Call.STATE_DISCONNECTED) {
                activeCall = null
                autoAnswerHelper?.cancelPendingAutoAnswer()
                CallStateTracker.onCallEnded()
            } else if (state == Call.STATE_ACTIVE) {
                CallStateTracker.onCallAnswered()
            }
        }
    }

    override fun onCallAdded(call: Call) {
        super.onCallAdded(call)
        activeCall = call
        call.registerCallback(callCallback)

        val handle = call.details.handle
        val phoneNumber = handle?.schemeSpecificPart ?: "Unknown"
        val displayName = call.details.callerDisplayName ?: phoneNumber

        CallStateTracker.onCallReceived(phoneNumber, displayName)

        if (call.state == Call.STATE_RINGING) {
            if (autoAnswerHelper == null) {
                autoAnswerHelper = NovaAutoAnswerHelper(applicationContext)
            }
            autoAnswerHelper?.onCallRinging(phoneNumber) {
                Log.i(TAG, "InCallService auto-answered call on last ring")
            }
        }
    }

    override fun onCallRemoved(call: Call) {
        super.onCallRemoved(call)
        call.unregisterCallback(callCallback)
        if (activeCall == call) {
            activeCall = null
        }
        autoAnswerHelper?.cancelPendingAutoAnswer()
        CallStateTracker.onCallEnded()
    }

    fun answerCall() {
        activeCall?.answer(0)
    }

    fun declineCall() {
        activeCall?.reject(Call.REJECT_REASON_DECLINED)
    }
}

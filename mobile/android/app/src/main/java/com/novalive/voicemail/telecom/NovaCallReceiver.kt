package com.novalive.voicemail.telecom

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.telephony.TelephonyManager
import android.util.Log

/**
 * NovaCallReceiver
 * 
 * BroadcastReceiver listening to TelephonyManager.ACTION_PHONE_STATE_CHANGED.
 * Automatically wakes up on live cellular calls:
 * 1. RINGING: Starts auto-answer countdown (last ring).
 * 2. If unanswered, auto-answers, announces "Udhaya is busy...", and hangs up!
 * 3. OFFHOOK / IDLE: Cancels countdown if picked up manually or caller hung up.
 */
class NovaCallReceiver : BroadcastReceiver() {

    companion object {
        private const val TAG = "NovaCallReceiver"
        private var autoAnswerHelper: NovaAutoAnswerHelper? = null

        fun getHelper(context: Context): NovaAutoAnswerHelper {
            if (autoAnswerHelper == null) {
                autoAnswerHelper = NovaAutoAnswerHelper(context.applicationContext)
            }
            return autoAnswerHelper!!
        }
    }

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != TelephonyManager.ACTION_PHONE_STATE_CHANGED) return

        val stateStr = intent.getStringExtra(TelephonyManager.EXTRA_STATE) ?: return
        val incomingNumber = intent.getStringExtra(TelephonyManager.EXTRA_INCOMING_NUMBER) ?: "Unknown Caller"
        Log.i(TAG, "Live Phone State: $stateStr for number: $incomingNumber")

        val helper = getHelper(context)

        when (stateStr) {
            TelephonyManager.EXTRA_STATE_RINGING -> {
                Log.i(TAG, "Call is ringing from: $incomingNumber")
                CallStateTracker.onCallReceived(incomingNumber, incomingNumber)
                helper.onCallRinging(incomingNumber) {
                    Log.i(TAG, "Auto-answer triggered for $incomingNumber")
                }
            }
            TelephonyManager.EXTRA_STATE_OFFHOOK -> {
                Log.i(TAG, "Call answered manually (offhook)")
                CallStateTracker.onCallAnswered()
                helper.cancelPendingAutoAnswer()
            }
            TelephonyManager.EXTRA_STATE_IDLE -> {
                Log.i(TAG, "Call idle / ended")
                CallStateTracker.onCallEnded()
                helper.cancelPendingAutoAnswer()
            }
        }
    }
}

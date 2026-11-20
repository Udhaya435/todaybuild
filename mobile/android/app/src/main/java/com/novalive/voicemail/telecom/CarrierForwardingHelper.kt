package com.novalive.voicemail.telecom

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.util.Log

object CarrierForwardingHelper {

    private const val TAG = "CarrierForwarding"

    /**
     * Builds standard GSM MMI code for unconditional or conditional forwarding
     * Type:
     * - "no_answer": *61*<number>**<seconds>#
     * - "busy": *67*<number>#
     * - "unreachable": *62*<number>#
     * - "all_conditional": **004*<number>#
     */
    fun buildMmiCode(type: String, targetNumber: String, ringSeconds: Int = 20): String {
        return when (type) {
            "busy" -> "*67*$targetNumber#"
            "unreachable" -> "*62*$targetNumber#"
            "all_conditional" -> "**004*$targetNumber#"
            "disable_all" -> "##002#"
            "status_check" -> "*#004#"
            "no_answer" -> "*61*$targetNumber**$ringSeconds#"
            else -> "*61*$targetNumber**$ringSeconds#"
        }
    }

    /**
     * Dials the MMI code using Android's Telephony Dialer Intent
     * Requires '#' to be Uri-encoded as '%23'
     */
    fun dialMmiCode(context: Context, mmiCode: String): Boolean {
        return try {
            val encodedHash = mmiCode.replace("#", Uri.encode("#"))
            val intent = Intent(Intent.ACTION_DIAL).apply {
                data = Uri.parse("tel:$encodedHash")
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            context.startActivity(intent)
            Log.d(TAG, "Launched dialer for MMI code: $mmiCode")
            true
        } catch (e: Exception) {
            Log.e(TAG, "Failed to launch MMI dialer intent", e)
            false
        }
    }
}

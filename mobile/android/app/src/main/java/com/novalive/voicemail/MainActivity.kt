package com.novalive.voicemail

import android.content.Intent
import android.os.Bundle
import com.facebook.react.ReactActivity
import com.novalive.voicemail.telecom.CallStateTracker

class MainActivity : ReactActivity() {
    override fun getMainComponentName(): String = "NovaLiveVoicemail"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        handleCallIntent(intent)
    }

    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        setIntent(intent)
        handleCallIntent(intent)
    }

    private fun handleCallIntent(intent: Intent?) {
        val callerNumber = intent?.getStringExtra("callerNumber")
        val callerName = intent?.getStringExtra("callerName")
        if (!callerNumber.isNullOrEmpty()) {
            CallStateTracker.onCallReceived(callerNumber, callerName)
        }
    }
}

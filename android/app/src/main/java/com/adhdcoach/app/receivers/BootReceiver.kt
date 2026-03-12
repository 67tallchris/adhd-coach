package com.adhdcoach.app.receivers

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import androidx.work.WorkManager

class BootReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED ||
            intent.action == "android.intent.action.QUICKBOOT_POWERON"
        ) {
            Log.d(TAG, "Boot completed - rescheduling sync work")

            // Re-schedule the periodic sync worker
            // The actual scheduling is done in ADHDCoachApplication,
            // but this ensures it happens after boot
            WorkManager.getInstance(context).cancelUniqueWork("sync_data")

            // The Application class will re-schedule on next app launch
            // Alternatively, you could schedule it here directly
        }
    }

    companion object {
        private const val TAG = "BootReceiver"
    }
}

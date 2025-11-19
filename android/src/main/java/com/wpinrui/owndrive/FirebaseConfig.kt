package com.wpinrui.owndrive

import android.content.Context
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions

object FirebaseConfig {
    // The app ID format is: 1:PROJECT_ID:android:PACKAGE_NAME
    // Replace with your actual app ID from Firebase Console if you have it
    private const val APPLICATION_ID = "1:477003768849:android:cafbbb81b628d75e4f7db0"
    
    fun initialize(context: Context) {
        // Check if Firebase is already initialized
        if (FirebaseApp.getApps(context).isNotEmpty()) {
            return
        }
        
        // Load settings from SharedPreferences
        val settings = SettingsManager.getFirebaseSettings(context)
            ?: throw IllegalStateException("Firebase settings not configured. Please configure them in Settings.")
        
        val options = FirebaseOptions.Builder()
            .setApiKey(settings.apiKey)
            .setApplicationId(APPLICATION_ID)
            .setProjectId(settings.projectId)
            .setStorageBucket(settings.storageBucket)
            .build()
        
        FirebaseApp.initializeApp(context, options)
    }
    
    fun reinitialize(context: Context) {
        // Note: Firebase apps cannot be deleted once initialized
        // The app will need to be restarted for new settings to take full effect
        // For now, we'll just update the settings in SharedPreferences
        // The next app launch will use the new settings
    }
}


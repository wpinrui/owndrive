package com.wpinrui.owndrive

import android.content.Context
import android.content.SharedPreferences

data class FirebaseSettings(
    val apiKey: String,
    val projectId: String,
    val storageBucket: String
)

enum class SortKey {
    NAME, SIZE, LAST_MODIFIED, STARRED, TYPE
}

enum class SortOrder {
    ASC, DESC
}

object SettingsManager {
    private const val PREFS_NAME = "owndrive_settings"
    private const val KEY_API_KEY = "firebase_api_key"
    private const val KEY_PROJECT_ID = "firebase_project_id"
    private const val KEY_STORAGE_BUCKET = "firebase_storage_bucket"
    private const val KEY_SORT_KEY = "sort_key"
    private const val KEY_SORT_ORDER = "sort_order"
    private const val KEY_SHOW_STARRED_FIRST = "show_starred_first"
    
    private fun getSharedPreferences(context: Context): SharedPreferences {
        return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    }
    
    fun getFirebaseSettings(context: Context): FirebaseSettings? {
        val prefs = getSharedPreferences(context)
        val apiKey = prefs.getString(KEY_API_KEY, null)
        val projectId = prefs.getString(KEY_PROJECT_ID, null)
        val storageBucket = prefs.getString(KEY_STORAGE_BUCKET, null)
        
        // Return null if any required field is missing
        if (apiKey.isNullOrBlank() || projectId.isNullOrBlank() || storageBucket.isNullOrBlank()) {
            return null
        }
        
        return FirebaseSettings(
            apiKey = apiKey,
            projectId = projectId,
            storageBucket = storageBucket
        )
    }
    
    fun saveFirebaseSettings(context: Context, settings: FirebaseSettings) {
        val prefs = getSharedPreferences(context)
        prefs.edit().apply {
            putString(KEY_API_KEY, settings.apiKey)
            putString(KEY_PROJECT_ID, settings.projectId)
            putString(KEY_STORAGE_BUCKET, settings.storageBucket)
            apply()
        }
    }
    
    fun hasCustomSettings(context: Context): Boolean {
        val prefs = getSharedPreferences(context)
        return prefs.contains(KEY_PROJECT_ID) || prefs.contains(KEY_STORAGE_BUCKET)
    }
    
    fun getSortKey(context: Context): SortKey {
        val prefs = getSharedPreferences(context)
        val keyName = prefs.getString(KEY_SORT_KEY, SortKey.NAME.name) ?: SortKey.NAME.name
        return try {
            SortKey.valueOf(keyName)
        } catch (e: IllegalArgumentException) {
            SortKey.NAME
        }
    }
    
    fun saveSortKey(context: Context, sortKey: SortKey) {
        val prefs = getSharedPreferences(context)
        prefs.edit().putString(KEY_SORT_KEY, sortKey.name).apply()
    }
    
    fun getSortOrder(context: Context): SortOrder {
        val prefs = getSharedPreferences(context)
        val orderName = prefs.getString(KEY_SORT_ORDER, SortOrder.ASC.name) ?: SortOrder.ASC.name
        return try {
            SortOrder.valueOf(orderName)
        } catch (e: IllegalArgumentException) {
            SortOrder.ASC
        }
    }
    
    fun saveSortOrder(context: Context, sortOrder: SortOrder) {
        val prefs = getSharedPreferences(context)
        prefs.edit().putString(KEY_SORT_ORDER, sortOrder.name).apply()
    }
    
    fun getShowStarredFirst(context: Context): Boolean {
        val prefs = getSharedPreferences(context)
        return prefs.getBoolean(KEY_SHOW_STARRED_FIRST, false)
    }
    
    fun saveShowStarredFirst(context: Context, showStarredFirst: Boolean) {
        val prefs = getSharedPreferences(context)
        prefs.edit().putBoolean(KEY_SHOW_STARRED_FIRST, showStarredFirst).apply()
    }
}


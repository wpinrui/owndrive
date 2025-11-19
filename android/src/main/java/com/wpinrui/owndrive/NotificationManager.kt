package com.wpinrui.owndrive

import androidx.compose.runtime.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.text.SimpleDateFormat
import java.util.*

enum class NotificationType {
    SUCCESS,
    ERROR,
    INFO,
    LOADING
}

data class Notification(
    val id: String,
    val message: String,
    val type: NotificationType,
    val progress: Int? = null, // 0-100 for progress indication
    val timestamp: Long = System.currentTimeMillis(),
    val isPermanent: Boolean = false // Permanent notifications stay until manually cleared
) {
    fun getFormattedTime(): String {
        val sdf = SimpleDateFormat("HH:mm", Locale.getDefault())
        return sdf.format(Date(timestamp))
    }
}

object NotificationManager {
    private val _notifications = MutableStateFlow<List<Notification>>(emptyList())
    val notifications: StateFlow<List<Notification>> = _notifications.asStateFlow()
    
    private val _hasActiveTasks = MutableStateFlow(false)
    val hasActiveTasks: StateFlow<Boolean> = _hasActiveTasks.asStateFlow()
    
    private val _overallProgress = MutableStateFlow<Float?>(null)
    val overallProgress: StateFlow<Float?> = _overallProgress.asStateFlow()
    
    fun showNotification(
        message: String,
        type: NotificationType,
        progress: Int? = null,
        isPermanent: Boolean = false
    ): String {
        val id = "notification-${System.currentTimeMillis()}-${Math.random()}"
        val notification = Notification(
            id = id,
            message = message,
            type = type,
            progress = progress,
            isPermanent = isPermanent || (type == NotificationType.SUCCESS || type == NotificationType.ERROR)
        )
        
        _notifications.value = _notifications.value + notification
        
        updateActiveTasksState()
        updateOverallProgress()
        
        return id
    }
    
    fun updateNotification(
        id: String,
        message: String? = null,
        type: NotificationType? = null,
        progress: Int? = null
    ) {
        _notifications.value = _notifications.value.map { notification ->
            if (notification.id == id) {
                notification.copy(
                    message = message ?: notification.message,
                    type = type ?: notification.type,
                    progress = progress ?: notification.progress
                )
            } else {
                notification
            }
        }
        
        updateActiveTasksState()
        updateOverallProgress()
    }
    
    fun completeNotification(id: String, success: Boolean = true) {
        _notifications.value = _notifications.value.map { notification ->
            if (notification.id == id) {
                if (success) {
                    // Convert loading to success
                    notification.copy(
                        type = NotificationType.SUCCESS,
                        progress = null,
                        isPermanent = true
                    )
                } else {
                    // Convert loading to error
                    notification.copy(
                        type = NotificationType.ERROR,
                        progress = null,
                        isPermanent = true
                    )
                }
            } else {
                notification
            }
        }
        
        // Remove loading notifications after a short delay (they're not permanent)
        // But keep success/error notifications
        updateActiveTasksState()
        updateOverallProgress()
    }
    
    fun dismissNotification(id: String) {
        _notifications.value = _notifications.value.filter { it.id != id }
        updateActiveTasksState()
        updateOverallProgress()
    }
    
    fun clearAllNotifications() {
        _notifications.value = emptyList()
        updateActiveTasksState()
        updateOverallProgress()
    }
    
    private fun updateActiveTasksState() {
        val hasLoading = _notifications.value.any { it.type == NotificationType.LOADING }
        _hasActiveTasks.value = hasLoading
    }
    
    private fun updateOverallProgress() {
        val loadingNotifications = _notifications.value.filter { it.type == NotificationType.LOADING && it.progress != null }
        if (loadingNotifications.isEmpty()) {
            _overallProgress.value = null
        } else {
            val avgProgress = loadingNotifications.mapNotNull { it.progress }.average().toFloat()
            _overallProgress.value = avgProgress / 100f
        }
    }
    
    fun getInProgressNotifications(): List<Notification> {
        return _notifications.value.filter { it.type == NotificationType.LOADING }
    }
    
    fun getCompletedNotifications(): List<Notification> {
        return _notifications.value.filter { it.type != NotificationType.LOADING }
    }
}


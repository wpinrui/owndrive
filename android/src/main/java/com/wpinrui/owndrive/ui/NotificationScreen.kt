package com.wpinrui.owndrive.ui

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.NotificationsNone
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.collectAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import com.wpinrui.owndrive.Notification
import com.wpinrui.owndrive.NotificationManager
import com.wpinrui.owndrive.NotificationType

@Composable
fun NotificationScreen(
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val notifications by NotificationManager.notifications.collectAsState()
    val inProgressNotifications = NotificationManager.getInProgressNotifications()
    val completedNotifications = NotificationManager.getCompletedNotifications()
    
    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        // Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Notifications",
                style = MaterialTheme.typography.headlineMedium,
                color = MaterialTheme.colorScheme.onBackground
            )
            
            Row {
                if (completedNotifications.isNotEmpty()) {
                    TextButton(onClick = { NotificationManager.clearAllNotifications() }) {
                        Text("Clear All")
                    }
                }
                
                IconButton(onClick = onBack) {
                    Icon(
                        imageVector = Icons.Filled.Close,
                        contentDescription = "Close",
                        tint = MaterialTheme.colorScheme.onBackground
                    )
                }
            }
        }
        
        // Notifications list
        if (notifications.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .weight(1f),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Icon(
                        imageVector = Icons.Outlined.NotificationsNone,
                        contentDescription = null,
                        modifier = Modifier.size(64.dp),
                        tint = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = "No notifications",
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // In-progress notifications first
                if (inProgressNotifications.isNotEmpty()) {
                    item {
                        Text(
                            text = "In Progress",
                            style = MaterialTheme.typography.titleSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.padding(vertical = 8.dp)
                        )
                    }
                    
                    items(inProgressNotifications) { notification ->
                        NotificationItem(
                            notification = notification,
                            onDismiss = {
                                // Don't allow dismissing in-progress notifications
                            }
                        )
                    }
                }
                
                // Completed notifications
                if (completedNotifications.isNotEmpty()) {
                    item {
                        Text(
                            text = "Completed",
                            style = MaterialTheme.typography.titleSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.padding(vertical = 8.dp)
                        )
                    }
                    
                    items(completedNotifications) { notification ->
                        NotificationItem(
                            notification = notification,
                            onDismiss = {
                                NotificationManager.dismissNotification(notification.id)
                            }
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun NotificationItem(
    notification: Notification,
    onDismiss: () -> Unit,
    modifier: Modifier = Modifier
) {
    val backgroundColor = when (notification.type) {
        NotificationType.SUCCESS -> MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.3f)
        NotificationType.ERROR -> MaterialTheme.colorScheme.errorContainer.copy(alpha = 0.3f)
        NotificationType.INFO -> MaterialTheme.colorScheme.secondaryContainer.copy(alpha = 0.3f)
        NotificationType.LOADING -> MaterialTheme.colorScheme.tertiaryContainer.copy(alpha = 0.3f)
    }
    
    val borderColor = when (notification.type) {
        NotificationType.SUCCESS -> MaterialTheme.colorScheme.primary
        NotificationType.ERROR -> MaterialTheme.colorScheme.error
        NotificationType.INFO -> MaterialTheme.colorScheme.secondary
        NotificationType.LOADING -> MaterialTheme.colorScheme.tertiary
    }
    
    val icon = when (notification.type) {
        NotificationType.SUCCESS -> Icons.Filled.CheckCircle
        NotificationType.ERROR -> Icons.Filled.Error
        NotificationType.INFO -> Icons.Filled.Info
        NotificationType.LOADING -> Icons.Filled.HourglassEmpty
    }
    
    val iconColor = when (notification.type) {
        NotificationType.SUCCESS -> MaterialTheme.colorScheme.primary
        NotificationType.ERROR -> MaterialTheme.colorScheme.error
        NotificationType.INFO -> MaterialTheme.colorScheme.secondary
        NotificationType.LOADING -> MaterialTheme.colorScheme.tertiary
    }
    
    Card(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp)),
        colors = CardDefaults.cardColors(
            containerColor = backgroundColor
        ),
        border = BorderStroke(
            width = 2.dp,
            color = borderColor
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Icon
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = iconColor,
                modifier = Modifier.size(24.dp)
            )
            
            // Content
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Text(
                    text = notification.message,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onBackground
                )
                
                // Progress bar for loading notifications
                if (notification.type == NotificationType.LOADING && notification.progress != null) {
                    LinearProgressIndicator(
                        progress = notification.progress / 100f,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(4.dp)
                            .clip(RoundedCornerShape(2.dp)),
                        color = iconColor,
                        trackColor = MaterialTheme.colorScheme.surfaceVariant
                    )
                }
                
                // Timestamp
                Text(
                    text = notification.getFormattedTime(),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            
            // Dismiss button (only for completed notifications)
            if (notification.type != NotificationType.LOADING) {
                IconButton(
                    onClick = onDismiss,
                    modifier = Modifier.size(32.dp)
                ) {
                    Icon(
                        imageVector = Icons.Filled.Close,
                        contentDescription = "Dismiss",
                        tint = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }
        }
    }
}


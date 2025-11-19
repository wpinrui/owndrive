package com.wpinrui.owndrive.ui

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import kotlin.math.cos
import kotlin.math.sin
import androidx.compose.ui.unit.dp
import com.wpinrui.owndrive.NotificationManager
import kotlinx.coroutines.delay

@Composable
fun NotificationBellButton(
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val hasActiveTasks by NotificationManager.hasActiveTasks.collectAsState()
    val overallProgress by NotificationManager.overallProgress.collectAsState()
    
    // Animation for glow effect when task completes
    var showGlow by remember { mutableStateOf(false) }
    var previousHasActiveTasks by remember { mutableStateOf(hasActiveTasks) }
    
    val glowAlpha by animateFloatAsState(
        targetValue = if (showGlow) 1f else 0f,
        animationSpec = tween(
            durationMillis = 800,
            easing = FastOutSlowInEasing
        ),
        label = "glow"
    )
    
    // Trigger glow animation when task completes
    LaunchedEffect(hasActiveTasks) {
        if (previousHasActiveTasks && !hasActiveTasks) {
            // Task just completed, show glow
            showGlow = true
            delay(800)
            showGlow = false
        }
        previousHasActiveTasks = hasActiveTasks
    }
    
    Box(
        modifier = modifier.size(48.dp),
        contentAlignment = Alignment.Center
    ) {
        // Circular progress indicator (only show when there are active tasks)
        if (hasActiveTasks && overallProgress != null) {
            CircularProgressRing(
                progress = overallProgress!!,
                modifier = Modifier.size(48.dp),
                color = MaterialTheme.colorScheme.primary,
                strokeWidth = 3.dp
            )
        }
        
        // Glow effect when task completes
        if (showGlow && !hasActiveTasks) {
            CircularProgressGlow(
                modifier = Modifier.size(48.dp),
                alpha = glowAlpha
            )
        }
        
        // Bell icon button
        IconButton(
            onClick = onClick,
            modifier = Modifier.size(48.dp)
        ) {
            Icon(
                imageVector = Icons.Filled.Notifications,
                contentDescription = "Notifications",
                tint = MaterialTheme.colorScheme.onBackground
            )
        }
    }
}

@Composable
private fun CircularProgressRing(
    progress: Float,
    modifier: Modifier = Modifier,
    color: androidx.compose.ui.graphics.Color,
    strokeWidth: androidx.compose.ui.unit.Dp
) {
    Canvas(modifier = modifier) {
        val strokeWidthPx = strokeWidth.toPx()
        val radius = (size.minDimension - strokeWidthPx) / 2f
        val center = Offset(size.width / 2f, size.height / 2f)
        
        // Draw background circle
        drawCircle(
            color = color.copy(alpha = 0.2f),
            radius = radius,
            center = center,
            style = Stroke(width = strokeWidthPx, cap = StrokeCap.Round)
        )
        
        // Draw progress arc
        val sweepAngle = 360f * progress
        val path = Path().apply {
            val startAngleRad = Math.toRadians(-90.0)
            val startX = center.x + radius * cos(startAngleRad).toFloat()
            val startY = center.y + radius * sin(startAngleRad).toFloat()
            moveTo(startX, startY)
            val oval = Rect(
                left = center.x - radius,
                top = center.y - radius,
                right = center.x + radius,
                bottom = center.y + radius
            )
            addArc(
                oval = oval,
                startAngleDegrees = -90f,
                sweepAngleDegrees = sweepAngle
            )
        }
        drawPath(
            path = path,
            color = color,
            style = Stroke(width = strokeWidthPx, cap = StrokeCap.Round)
        )
    }
}

@Composable
private fun CircularProgressGlow(
    modifier: Modifier = Modifier,
    alpha: Float
) {
    val primaryColor = MaterialTheme.colorScheme.primary
    Canvas(modifier = modifier) {
        val strokeWidth = 4.dp.toPx()
        val radius = (size.minDimension - strokeWidth) / 2f
        val center = Offset(size.width / 2f, size.height / 2f)
        
        // Draw glowing circle
        drawCircle(
            color = Color.White.copy(alpha = alpha * 0.3f),
            radius = radius + strokeWidth,
            center = center,
            style = Stroke(width = strokeWidth * 2)
        )
        
        drawCircle(
            color = primaryColor.copy(alpha = alpha),
            radius = radius,
            center = center,
            style = Stroke(width = strokeWidth)
        )
    }
}


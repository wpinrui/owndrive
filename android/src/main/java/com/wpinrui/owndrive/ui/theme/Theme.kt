package com.wpinrui.owndrive.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

private val DarkColorScheme = darkColorScheme(
    primary = AccentBlue,
    onPrimary = TextPrimary,
    primaryContainer = AccentBlueHover,
    onPrimaryContainer = TextPrimary,
    
    secondary = AccentBlueHover,
    onSecondary = TextPrimary,
    
    tertiary = AccentYellow,
    onTertiary = TextPrimary,
    
    background = BgPrimary,
    onBackground = TextPrimary,
    
    surface = BgSecondary,
    onSurface = TextPrimary,
    surfaceVariant = BgTertiary,
    onSurfaceVariant = TextSecondary,
    
    error = AccentRed,
    onError = TextPrimary,
    errorContainer = AccentRedHover,
    onErrorContainer = TextPrimary,
    
    outline = BorderPrimary,
    outlineVariant = BorderSecondary,
    
    scrim = BgPrimary,
    inverseSurface = TextPrimary,
    inverseOnSurface = BgPrimary,
    inversePrimary = AccentBlueHover
)

@Composable
fun OwnDriveTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        typography = Typography,
        content = content
    )
}
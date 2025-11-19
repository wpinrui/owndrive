package com.wpinrui.owndrive.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

private val DarkColorScheme = darkColorScheme(
    primary = DarkAccentBlue,
    onPrimary = DarkTextPrimary,
    primaryContainer = DarkAccentBlueHover,
    onPrimaryContainer = DarkTextPrimary,
    
    secondary = DarkAccentBlueHover,
    onSecondary = DarkTextPrimary,
    
    tertiary = DarkAccentYellow,
    onTertiary = DarkTextPrimary,
    
    background = DarkBgPrimary,
    onBackground = DarkTextPrimary,
    
    surface = DarkBgSecondary,
    onSurface = DarkTextPrimary,
    surfaceVariant = DarkBgTertiary,
    onSurfaceVariant = DarkTextSecondary,
    
    error = DarkAccentRed,
    onError = DarkTextPrimary,
    errorContainer = DarkAccentRedHover,
    onErrorContainer = DarkTextPrimary,
    
    outline = DarkBorderPrimary,
    outlineVariant = DarkBorderSecondary,
    
    scrim = DarkBgPrimary,
    inverseSurface = DarkTextPrimary,
    inverseOnSurface = DarkBgPrimary,
    inversePrimary = DarkAccentBlueHover
)

private val LightColorScheme = lightColorScheme(
    primary = LightAccentBlue,
    onPrimary = LightTextPrimary,
    primaryContainer = LightAccentBlueHover,
    onPrimaryContainer = LightTextPrimary,
    
    secondary = LightAccentBlueHover,
    onSecondary = LightTextPrimary,
    
    tertiary = LightAccentYellow,
    onTertiary = LightTextPrimary,
    
    background = LightBgPrimary,
    onBackground = LightTextPrimary,
    
    surface = LightBgSecondary,
    onSurface = LightTextPrimary,
    surfaceVariant = LightBgTertiary,
    onSurfaceVariant = LightTextSecondary,
    
    error = LightAccentRed,
    onError = LightTextPrimary,
    errorContainer = LightAccentRedHover,
    onErrorContainer = LightTextPrimary,
    
    outline = LightBorderPrimary,
    outlineVariant = LightBorderSecondary,
    
    scrim = LightBgPrimary,
    inverseSurface = LightTextPrimary,
    inverseOnSurface = LightBgPrimary,
    inversePrimary = LightAccentBlueHover
)

@Composable
fun OwnDriveTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) {
        DarkColorScheme
    } else {
        LightColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
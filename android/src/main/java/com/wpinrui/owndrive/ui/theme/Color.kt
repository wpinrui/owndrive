package com.wpinrui.owndrive.ui.theme

import androidx.compose.ui.graphics.Color

// Dark Theme Colors (matching desktop OwnDrive)
val DarkBgPrimary = Color(0xFF1E1E1E)
val DarkBgSecondary = Color(0xFF252526)
val DarkBgTertiary = Color(0xFF2D2D30)
val DarkBgHover = Color(0xFF2A2D2E)
val DarkBgSelected = Color(0xFF094771)
val DarkBgSelectedHover = Color(0xFF0D5A8F)

val DarkTextPrimary = Color(0xFFE0E0E0)
val DarkTextSecondary = Color(0xFF9D9D9D)
val DarkTextMuted = Color(0xFF6D6D6D)

val DarkBorderPrimary = Color(0xFF3E3E42)
val DarkBorderSecondary = Color(0xFF4E4E52)

val DarkAccentBlue = Color(0xFF0E639C)
val DarkAccentBlueHover = Color(0xFF1177BB)
val DarkAccentRed = Color(0xFFA12D2D)
val DarkAccentRedHover = Color(0xFFC73838)
val DarkAccentYellow = Color(0xFF6B5B0E)
val DarkAccentYellowHover = Color(0xFF8A7510)

// Light Theme Colors
val LightBgPrimary = Color(0xFFFFFFFF)
val LightBgSecondary = Color(0xFFF5F5F5)
val LightBgTertiary = Color(0xFFEEEEEE)
val LightBgHover = Color(0xFFE8E8E8)
val LightBgSelected = Color(0xFFE3F2FD)
val LightBgSelectedHover = Color(0xFFBBDEFB)

val LightTextPrimary = Color(0xFF212121)
val LightTextSecondary = Color(0xFF757575)
val LightTextMuted = Color(0xFF9E9E9E)

val LightBorderPrimary = Color(0xFFE0E0E0)
val LightBorderSecondary = Color(0xFFBDBDBD)

val LightAccentBlue = Color(0xFF1976D2)
val LightAccentBlueHover = Color(0xFF1565C0)
val LightAccentRed = Color(0xFFD32F2F)
val LightAccentRedHover = Color(0xFFC62828)
val LightAccentYellow = Color(0xFFF57C00)
val LightAccentYellowHover = Color(0xFFE65100)

// Legacy aliases for backward compatibility (using dark theme as default)
@Deprecated("Use theme-aware colors instead", ReplaceWith("DarkBgPrimary"))
val BgPrimary = DarkBgPrimary
@Deprecated("Use theme-aware colors instead", ReplaceWith("DarkBgSecondary"))
val BgSecondary = DarkBgSecondary
@Deprecated("Use theme-aware colors instead", ReplaceWith("DarkBgTertiary"))
val BgTertiary = DarkBgTertiary
@Deprecated("Use theme-aware colors instead", ReplaceWith("DarkBgHover"))
val BgHover = DarkBgHover
@Deprecated("Use theme-aware colors instead", ReplaceWith("DarkBgSelected"))
val BgSelected = DarkBgSelected
@Deprecated("Use theme-aware colors instead", ReplaceWith("DarkBgSelectedHover"))
val BgSelectedHover = DarkBgSelectedHover
@Deprecated("Use theme-aware colors instead", ReplaceWith("DarkTextPrimary"))
val TextPrimary = DarkTextPrimary
@Deprecated("Use theme-aware colors instead", ReplaceWith("DarkTextSecondary"))
val TextSecondary = DarkTextSecondary
@Deprecated("Use theme-aware colors instead", ReplaceWith("DarkTextMuted"))
val TextMuted = DarkTextMuted
@Deprecated("Use theme-aware colors instead", ReplaceWith("DarkBorderPrimary"))
val BorderPrimary = DarkBorderPrimary
@Deprecated("Use theme-aware colors instead", ReplaceWith("DarkBorderSecondary"))
val BorderSecondary = DarkBorderSecondary
@Deprecated("Use theme-aware colors instead", ReplaceWith("DarkAccentBlue"))
val AccentBlue = DarkAccentBlue
@Deprecated("Use theme-aware colors instead", ReplaceWith("DarkAccentBlueHover"))
val AccentBlueHover = DarkAccentBlueHover
@Deprecated("Use theme-aware colors instead", ReplaceWith("DarkAccentRed"))
val AccentRed = DarkAccentRed
@Deprecated("Use theme-aware colors instead", ReplaceWith("DarkAccentRedHover"))
val AccentRedHover = DarkAccentRedHover
@Deprecated("Use theme-aware colors instead", ReplaceWith("DarkAccentYellow"))
val AccentYellow = DarkAccentYellow
@Deprecated("Use theme-aware colors instead", ReplaceWith("DarkAccentYellowHover"))
val AccentYellowHover = DarkAccentYellowHover
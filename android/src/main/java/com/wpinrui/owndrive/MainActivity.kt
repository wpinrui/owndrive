package com.wpinrui.owndrive

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.asPaddingValues
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.statusBars
import androidx.compose.foundation.layout.union
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import com.wpinrui.owndrive.ui.FileListScreen
import com.wpinrui.owndrive.ui.FirstLaunchScreen
import com.wpinrui.owndrive.ui.NotificationScreen
import com.wpinrui.owndrive.ui.SettingsScreen
import com.wpinrui.owndrive.ui.theme.OwnDriveTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        enableEdgeToEdge()
        setContent {
            OwnDriveTheme {
                var showSettings by remember { mutableStateOf(false) }
                var showNotifications by remember { mutableStateOf(false) }
                var showFirstLaunch by remember { mutableStateOf(true) } // Start with true to check
                var isFirebaseInitialized by remember { mutableStateOf(false) }
                var configCheckTrigger by remember { mutableStateOf(0) }
                
                // Check if Firebase config exists and initialize
                LaunchedEffect(Unit, configCheckTrigger) {
                    val hasConfig = SettingsManager.getFirebaseSettings(this@MainActivity) != null
                    
                    if (hasConfig) {
                        try {
                            FirebaseConfig.initialize(this@MainActivity)
                            isFirebaseInitialized = true
                            showFirstLaunch = false
                        } catch (e: Exception) {
                            // If initialization fails, show first launch screen
                            isFirebaseInitialized = false
                            showFirstLaunch = true
                        }
                    } else {
                        isFirebaseInitialized = false
                        showFirstLaunch = true
                    }
                }
                
                // Disable back button when first launch screen is shown
                BackHandler(enabled = showFirstLaunch) {
                    // Do nothing - prevent back button on first launch
                }
                
                Scaffold(
                    modifier = Modifier.fillMaxSize(),
                    contentWindowInsets = WindowInsets.statusBars.union(WindowInsets.navigationBars)
                ) { paddingValues ->
                    val contentPadding = Modifier.padding(
                        top = WindowInsets.statusBars.asPaddingValues().calculateTopPadding(),
                        bottom = WindowInsets.navigationBars.asPaddingValues().calculateTopPadding()
                    )
                    
                    when {
                        showFirstLaunch -> {
                            FirstLaunchScreen(
                                onConfigSaved = {
                                    // Trigger a re-check of settings
                                    configCheckTrigger++
                                },
                                modifier = contentPadding
                            )
                        }
                        showNotifications -> {
                            NotificationScreen(
                                onBack = { showNotifications = false },
                                modifier = contentPadding
                            )
                        }
                        showSettings -> {
                            SettingsScreen(
                                onBack = { showSettings = false },
                                modifier = contentPadding
                            )
                        }
                        isFirebaseInitialized -> {
                            FileListScreen(
                                onSettingsClick = { showSettings = true },
                                onNotificationsClick = { showNotifications = true },
                                modifier = contentPadding
                            )
                        }
                        else -> {
                            // Loading or error state - show first launch
                            FirstLaunchScreen(
                                onConfigSaved = {
                                    configCheckTrigger++
                                },
                                modifier = contentPadding
                            )
                        }
                    }
                }
            }
        }
    }
}

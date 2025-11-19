package com.wpinrui.owndrive

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.wpinrui.owndrive.ui.FileListScreen
import com.wpinrui.owndrive.ui.SettingsScreen
import com.wpinrui.owndrive.ui.theme.OwnDriveTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Initialize Firebase with saved configuration
        FirebaseConfig.initialize(this)
        
        enableEdgeToEdge()
        setContent {
            OwnDriveTheme {
                var showSettings by remember { mutableStateOf(false) }
                
                Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                    if (showSettings) {
                        SettingsScreen(onBack = { showSettings = false })
                    } else {
                        FileListScreen(onSettingsClick = { showSettings = true })
                    }
                }
            }
        }
    }
}
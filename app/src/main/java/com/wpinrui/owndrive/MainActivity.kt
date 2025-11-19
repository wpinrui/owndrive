package com.wpinrui.owndrive

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Scaffold
import androidx.compose.ui.Modifier
import com.wpinrui.owndrive.ui.FileListScreen
import com.wpinrui.owndrive.ui.theme.OwnDriveTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Initialize Firebase with hardcoded configuration
        FirebaseConfig.initialize(this)
        
        enableEdgeToEdge()
        setContent {
            OwnDriveTheme {
                Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                    FileListScreen()
                }
            }
        }
    }
}
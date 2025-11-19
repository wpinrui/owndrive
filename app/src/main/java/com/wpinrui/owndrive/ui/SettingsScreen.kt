package com.wpinrui.owndrive.ui

import android.content.Context
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.wpinrui.owndrive.FirebaseConfig
import com.wpinrui.owndrive.FirebaseSettings
import com.wpinrui.owndrive.SettingsManager

@Composable
fun SettingsScreen(onBack: () -> Unit) {
    val context = LocalContext.current
    val currentSettings = remember { SettingsManager.getFirebaseSettings(context) }
    
    var apiKey by remember { mutableStateOf(currentSettings?.apiKey ?: "") }
    var projectId by remember { mutableStateOf(currentSettings?.projectId ?: "") }
    var storageBucket by remember { mutableStateOf(currentSettings?.storageBucket ?: "") }
    var showSaveSuccess by remember { mutableStateOf(false) }
    var showSaveError by remember { mutableStateOf<String?>(null) }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        // Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onBack) {
                Icon(
                    imageVector = Icons.Default.ArrowBack,
                    contentDescription = "Back"
                )
            }
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = "Settings",
                style = MaterialTheme.typography.headlineMedium
            )
        }
        
        Spacer(modifier = Modifier.height(24.dp))
        
        // Firebase Configuration Section
        Card(
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(16.dp)
            ) {
                Text(
                    text = "Firebase Configuration",
                    style = MaterialTheme.typography.titleLarge,
                    modifier = Modifier.padding(bottom = 8.dp)
                )
                Text(
                    text = "Configure your Firebase project credentials. These are stored locally and required to connect to your Firebase Storage and Firestore.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(bottom = 16.dp)
                )
                
                // API Key
                OutlinedTextField(
                    value = apiKey,
                    onValueChange = { apiKey = it },
                    label = { Text("API Key") },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 12.dp),
                    singleLine = true
                )
                
                // Project ID
                OutlinedTextField(
                    value = projectId,
                    onValueChange = { projectId = it },
                    label = { Text("Project ID") },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 12.dp),
                    singleLine = true
                )
                
                // Storage Bucket
                OutlinedTextField(
                    value = storageBucket,
                    onValueChange = { storageBucket = it },
                    label = { Text("Storage Bucket") },
                    placeholder = { Text("e.g., project-id.appspot.com") },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 16.dp),
                    singleLine = true
                )
                
                // Save Button
                Button(
                    onClick = {
                        try {
                            val newSettings = FirebaseSettings(
                                apiKey = apiKey.trim(),
                                projectId = projectId.trim(),
                                storageBucket = storageBucket.trim()
                            )
                            
                            // Validate that required fields are not empty
                            if (newSettings.apiKey.isEmpty() || 
                                newSettings.projectId.isEmpty() || 
                                newSettings.storageBucket.isEmpty()) {
                                showSaveError = "All fields are required"
                                return@Button
                            }
                            
                            // Save settings
                            SettingsManager.saveFirebaseSettings(context, newSettings)
                            
                            // Reinitialize Firebase with new settings
                            FirebaseConfig.reinitialize(context)
                            
                            showSaveSuccess = true
                            showSaveError = null
                        } catch (e: Exception) {
                            showSaveError = "Failed to save settings: ${e.message}"
                        }
                    },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Save")
                }
                
                // Success message
                if (showSaveSuccess) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Settings saved successfully! Please restart the app for the new Firebase configuration to take effect.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.padding(top = 8.dp)
                    )
                }
                
                // Error message
                if (showSaveError != null) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = showSaveError!!,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.error,
                        modifier = Modifier.padding(top = 8.dp)
                    )
                }
            }
        }
    }
}


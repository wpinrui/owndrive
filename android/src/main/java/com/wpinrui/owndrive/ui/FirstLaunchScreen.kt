package com.wpinrui.owndrive.ui

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import com.wpinrui.owndrive.FirebaseSettings
import com.wpinrui.owndrive.SettingsManager
import kotlinx.coroutines.delay

/**
 * Parses Firebase config code from text
 * Handles various formats including:
 * - Full Firebase config object with comments
 * - Just the firebaseConfig object
 * - Individual key-value pairs
 */
private fun parseFirebaseConfig(text: String): Triple<String?, String?, String?> {
    if (text.isBlank()) return Triple(null, null, null)

    var apiKey: String? = null
    var projectId: String? = null
    var storageBucket: String? = null

    // Match: apiKey: "...", or apiKey: '...',
    val apiKeyRegex = Regex("""apiKey\s*:\s*["']([^"']+)["']""")
    apiKeyRegex.find(text)?.groupValues?.get(1)?.let { apiKey = it }

    // Match: projectId: "...", or projectId: '...',
    val projectIdRegex = Regex("""projectId\s*:\s*["']([^"']+)["']""")
    projectIdRegex.find(text)?.groupValues?.get(1)?.let { projectId = it }

    // Match: storageBucket: "...", or storageBucket: '...',
    val storageBucketRegex = Regex("""storageBucket\s*:\s*["']([^"']+)["']""")
    storageBucketRegex.find(text)?.groupValues?.get(1)?.let { storageBucket = it }

    return Triple(apiKey, projectId, storageBucket)
}

@Composable
fun FirstLaunchScreen(
    onConfigSaved: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val clipboardManager = context.getSystemService(Context.CLIPBOARD_SERVICE) as? ClipboardManager
    
    var apiKey by remember { mutableStateOf("") }
    var projectId by remember { mutableStateOf("") }
    var storageBucket by remember { mutableStateOf("") }
    var pasteError by remember { mutableStateOf<String?>(null) }
    var pasteSuccess by remember { mutableStateOf(false) }
    var saveError by remember { mutableStateOf<String?>(null) }
    var isSaving by remember { mutableStateOf(false) }
    
    // Clear success message after 3 seconds
    LaunchedEffect(pasteSuccess) {
        if (pasteSuccess) {
            delay(3000)
            pasteSuccess = false
        }
    }

    val handlePasteFromClipboard = {
        try {
            val clipData = clipboardManager?.primaryClip
            val text = clipData?.getItemAt(0)?.text?.toString() ?: ""
            
            if (text.isBlank()) {
                pasteError = "Clipboard is empty"
                pasteSuccess = false
            } else {
                val (parsedApiKey, parsedProjectId, parsedStorageBucket) = parseFirebaseConfig(text)
                
                if (parsedApiKey == null && parsedProjectId == null && parsedStorageBucket == null) {
                    pasteError = "Could not parse Firebase config from clipboard"
                    pasteSuccess = false
                } else {
                    if (parsedApiKey != null) apiKey = parsedApiKey
                    if (parsedProjectId != null) projectId = parsedProjectId
                    if (parsedStorageBucket != null) storageBucket = parsedStorageBucket

                    pasteSuccess = true
                    pasteError = null
                }
            }
        } catch (e: Exception) {
            pasteError = "Failed to read from clipboard: ${e.message}"
            pasteSuccess = false
        }
    }


    val handleSave = {
        val trimmedApiKey = apiKey.trim()
        val trimmedProjectId = projectId.trim()
        val trimmedStorageBucket = storageBucket.trim()

        if (trimmedApiKey.isEmpty() || trimmedProjectId.isEmpty() || trimmedStorageBucket.isEmpty()) {
            saveError = "All fields are required"
        } else {
            isSaving = true
            saveError = null

            try {
                val newSettings = FirebaseSettings(
                    apiKey = trimmedApiKey,
                    projectId = trimmedProjectId,
                    storageBucket = trimmedStorageBucket
                )
                
                SettingsManager.saveFirebaseSettings(context, newSettings)
                
                isSaving = false
                
                // Notify parent that config was saved
                onConfigSaved()
            } catch (e: Exception) {
                saveError = "Failed to save settings: ${e.message}"
                isSaving = false
            }
        }
    }

    val canSave = apiKey.trim().isNotEmpty() && 
                  projectId.trim().isNotEmpty() && 
                  storageBucket.trim().isNotEmpty()

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        // Header
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 24.dp)
        ) {
            Text(
                text = "Welcome to OwnDrive",
                style = MaterialTheme.typography.headlineMedium,
                color = MaterialTheme.colorScheme.onBackground
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Please configure your Firebase credentials to get started. These are stored locally and required to connect to your Firebase Storage and Firestore.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }

        // Input Fields Section
        Column(
            modifier = Modifier.fillMaxWidth()
        ) {
            // API Key
            OutlinedTextField(
                value = apiKey,
                onValueChange = { 
                    apiKey = it
                    pasteError = null
                },
                label = { Text("API Key *") },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 12.dp),
                singleLine = true,
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Next),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = MaterialTheme.colorScheme.primary,
                    unfocusedBorderColor = MaterialTheme.colorScheme.outline
                )
            )

            // Project ID
            OutlinedTextField(
                value = projectId,
                onValueChange = { 
                    projectId = it
                    pasteError = null
                },
                label = { Text("Project ID *") },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 12.dp),
                singleLine = true,
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Next),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = MaterialTheme.colorScheme.primary,
                    unfocusedBorderColor = MaterialTheme.colorScheme.outline
                )
            )

            // Storage Bucket
            OutlinedTextField(
                value = storageBucket,
                onValueChange = { 
                    storageBucket = it
                    pasteError = null
                },
                label = { Text("Storage Bucket *") },
                placeholder = { Text("e.g., project-id.appspot.com") },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 12.dp),
                singleLine = true,
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
                keyboardActions = KeyboardActions(
                    onDone = { handleSave() }
                ),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = MaterialTheme.colorScheme.primary,
                    unfocusedBorderColor = MaterialTheme.colorScheme.outline
                )
            )
        }

        // OR Section
        Spacer(modifier = Modifier.height(16.dp))
        
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surfaceVariant
            )
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // OR Divider
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center
                ) {
                    HorizontalDivider(
                        modifier = Modifier.weight(1f),
                        color = MaterialTheme.colorScheme.outline
                    )
                    Text(
                        text = "OR",
                        modifier = Modifier.padding(horizontal = 12.dp),
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    HorizontalDivider(
                        modifier = Modifier.weight(1f),
                        color = MaterialTheme.colorScheme.outline
                    )
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                
                // Paste Button
                Button(
                    onClick = handlePasteFromClipboard,
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.primary
                    )
                ) {
                    Text(
                        text = "Auto-fill from Clipboard",
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
                
                Spacer(modifier = Modifier.height(8.dp))
                
                // Help Text
                Text(
                    text = "Paste your Firebase config code from the console",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    textAlign = androidx.compose.ui.text.style.TextAlign.Center
                )
                
                // Success/Error Messages
                if (pasteSuccess) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "✓ Config parsed!",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.primary
                    )
                }
                
                if (pasteError != null) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = pasteError!!,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.error,
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Save Button
        Button(
            onClick = handleSave,
            modifier = Modifier.fillMaxWidth(),
            enabled = canSave && !isSaving,
            colors = ButtonDefaults.buttonColors(
                containerColor = MaterialTheme.colorScheme.primary
            )
        ) {
            if (isSaving) {
                CircularProgressIndicator(
                    modifier = Modifier.size(16.dp),
                    color = MaterialTheme.colorScheme.onPrimary
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text("Saving...")
            } else {
                Text("Save & Continue")
            }
        }

        // Error message
        if (saveError != null) {
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = saveError!!,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.error
            )
        }
    }
}


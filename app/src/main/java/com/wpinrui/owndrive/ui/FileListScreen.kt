package com.wpinrui.owndrive.ui

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.ListenerRegistration
import com.wpinrui.owndrive.FileMeta

@Composable
fun FileListScreen(onSettingsClick: () -> Unit) {
    val db = FirebaseFirestore.getInstance()
    var files by remember { mutableStateOf<List<FileMeta>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(Unit) {
        try {
            val registration = db.collection("files")
                .addSnapshotListener { snapshot, e ->
                    if (e != null) {
                        error = "Error listening to files: ${e.message}"
                        isLoading = false
                        return@addSnapshotListener
                    }

                    if (snapshot != null) {
                        files = snapshot.documents.map { doc ->
                            val data = doc.data ?: emptyMap()
                            FileMeta(
                                id = doc.id,
                                name = data["name"] as? String ?: "",
                                size = (data["size"] as? Number)?.toLong() ?: 0L,
                                lastModified = (data["lastModified"] as? Number)?.toLong() ?: 0L,
                                starred = data["starred"] as? Boolean ?: false,
                                uploadedAt = (data["uploadedAt"] as? Number)?.toLong() ?: 0L,
                                storagePath = data["storagePath"] as? String ?: ""
                            )
                        }
                        isLoading = false
                        error = null
                    }
                }
            
            // Store registration to cleanup later if needed
            // For now, we'll keep it active for the lifetime of the composable
        } catch (e: Exception) {
            error = "Error initializing file listener: ${e.message}"
            isLoading = false
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Files from Firebase Storage",
                style = MaterialTheme.typography.headlineMedium
            )
            IconButton(onClick = onSettingsClick) {
                Icon(
                    imageVector = Icons.Default.Settings,
                    contentDescription = "Settings"
                )
            }
        }
        Spacer(modifier = Modifier.height(16.dp))

        when {
            isLoading -> {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator()
                }
            }
            error != null -> {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.errorContainer
                    )
                ) {
                    Text(
                        text = "Error: $error",
                        modifier = Modifier.padding(16.dp),
                        color = MaterialTheme.colorScheme.onErrorContainer
                    )
                }
            }
            files.isEmpty() -> {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "No files found",
                        style = MaterialTheme.typography.bodyLarge
                    )
                }
            }
            else -> {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(files) { file ->
                        FileItem(file = file)
                    }
                }
            }
        }
    }
}

@Composable
fun FileItem(file: FileMeta) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Text(
                text = file.name,
                style = MaterialTheme.typography.titleMedium
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "Size: ${formatFileSize(file.size)}",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            if (file.starred) {
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "⭐ Starred",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.primary
                )
            }
        }
    }
}

private fun formatFileSize(bytes: Long): String {
    val kb = bytes / 1024.0
    val mb = kb / 1024.0
    val gb = mb / 1024.0
    
    return when {
        gb >= 1 -> String.format("%.2f GB", gb)
        mb >= 1 -> String.format("%.2f MB", mb)
        kb >= 1 -> String.format("%.2f KB", kb)
        else -> "$bytes B"
    }
}


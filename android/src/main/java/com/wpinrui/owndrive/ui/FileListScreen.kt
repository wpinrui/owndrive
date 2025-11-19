package com.wpinrui.owndrive.ui

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.google.firebase.firestore.FirebaseFirestore
import com.wpinrui.owndrive.FileMeta
import com.wpinrui.owndrive.SettingsManager
import com.wpinrui.owndrive.SortKey
import com.wpinrui.owndrive.SortOrder

@Composable
fun FileListScreen(
    onSettingsClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    var files by remember { mutableStateOf<List<FileMeta>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    
    // Sort preferences
    var sortKey by remember { mutableStateOf(SettingsManager.getSortKey(context)) }
    var sortOrder by remember { mutableStateOf(SettingsManager.getSortOrder(context)) }
    var showStarredFirst by remember { mutableStateOf(SettingsManager.getShowStarredFirst(context)) }
    var showSortMenu by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        try {
            // Check if Firebase is initialized before using it
            val db = FirebaseFirestore.getInstance()
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
        } catch (e: IllegalStateException) {
            // Firebase not initialized
            error = "Firebase not configured. Please configure it in Settings."
            isLoading = false
        } catch (e: Exception) {
            error = "Error initializing file listener: ${e.message}"
            isLoading = false
        }
    }
    
    // Sort files
    val displayedFiles = remember(files, sortKey, sortOrder, showStarredFirst) {
        val sorted = sortFiles(files, sortKey, sortOrder)
        if (!showStarredFirst) {
            sorted
        } else {
            val starred = sorted.filter { it.starred }
            val unstarred = sorted.filter { !it.starred }
            starred + unstarred
        }
    }
    
    // Handle sort changes
    fun handleSort(newSortKey: SortKey) {
        if (newSortKey == sortKey) {
            // Toggle order if same key
            val newOrder = if (sortOrder == SortOrder.ASC) SortOrder.DESC else SortOrder.ASC
            sortOrder = newOrder
            SettingsManager.saveSortOrder(context, newOrder)
        } else {
            // Set new key with ascending order
            sortKey = newSortKey
            sortOrder = SortOrder.ASC
            SettingsManager.saveSortKey(context, newSortKey)
            SettingsManager.saveSortOrder(context, SortOrder.ASC)
        }
    }
    
    fun toggleStarredFirst() {
        showStarredFirst = !showStarredFirst
        SettingsManager.saveShowStarredFirst(context, showStarredFirst)
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "OwnDrive",
                style = MaterialTheme.typography.headlineMedium,
                color = MaterialTheme.colorScheme.onBackground
            )
            Row {
                // Sort menu button
                Box {
                    IconButton(onClick = { showSortMenu = true }) {
                        Icon(
                            imageVector = Icons.Default.MoreVert,
                            contentDescription = "Sort options",
                            tint = MaterialTheme.colorScheme.onBackground
                        )
                    }
                    DropdownMenu(
                        expanded = showSortMenu,
                        onDismissRequest = { showSortMenu = false }
                    ) {
                        // Sort by options
                        DropdownMenuItem(
                            text = { Text("Sort by Name") },
                            onClick = {
                                handleSort(SortKey.NAME)
                                showSortMenu = false
                            },
                            trailingIcon = {
                                if (sortKey == SortKey.NAME) {
                                    Text(if (sortOrder == SortOrder.ASC) "▲" else "▼")
                                }
                            }
                        )
                        DropdownMenuItem(
                            text = { Text("Sort by Size") },
                            onClick = {
                                handleSort(SortKey.SIZE)
                                showSortMenu = false
                            },
                            trailingIcon = {
                                if (sortKey == SortKey.SIZE) {
                                    Text(if (sortOrder == SortOrder.ASC) "▲" else "▼")
                                }
                            }
                        )
                        DropdownMenuItem(
                            text = { Text("Sort by Last Modified") },
                            onClick = {
                                handleSort(SortKey.LAST_MODIFIED)
                                showSortMenu = false
                            },
                            trailingIcon = {
                                if (sortKey == SortKey.LAST_MODIFIED) {
                                    Text(if (sortOrder == SortOrder.ASC) "▲" else "▼")
                                }
                            }
                        )
                        DropdownMenuItem(
                            text = { Text("Sort by Starred") },
                            onClick = {
                                handleSort(SortKey.STARRED)
                                showSortMenu = false
                            },
                            trailingIcon = {
                                if (sortKey == SortKey.STARRED) {
                                    Text(if (sortOrder == SortOrder.ASC) "▲" else "▼")
                                }
                            }
                        )
                        DropdownMenuItem(
                            text = { Text("Sort by Type") },
                            onClick = {
                                handleSort(SortKey.TYPE)
                                showSortMenu = false
                            },
                            trailingIcon = {
                                if (sortKey == SortKey.TYPE) {
                                    Text(if (sortOrder == SortOrder.ASC) "▲" else "▼")
                                }
                            }
                        )
                        Divider()
                        // Starred first toggle
                        DropdownMenuItem(
                            text = { 
                                Text(if (showStarredFirst) "⭐ Starred Files First" else "🗄️ Default File Order")
                            },
                            onClick = {
                                toggleStarredFirst()
                                showSortMenu = false
                            }
                        )
                    }
                }
                IconButton(onClick = onSettingsClick) {
                    Icon(
                        imageVector = Icons.Default.Settings,
                        contentDescription = "Settings",
                        tint = MaterialTheme.colorScheme.onBackground
                    )
                }
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
            displayedFiles.isEmpty() -> {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Text(
                            text = "📁",
                            style = MaterialTheme.typography.displayMedium,
                            modifier = Modifier.padding(bottom = 16.dp)
                        )
                        Text(
                            text = "No files found",
                            style = MaterialTheme.typography.bodyLarge,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
            else -> {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(displayedFiles) { file ->
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
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = file.name,
                        style = MaterialTheme.typography.titleMedium,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Size: ${formatFileSize(file.size)}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = "Modified: ${formatDate(file.lastModified)}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                if (file.starred) {
                    Text(
                        text = "⭐",
                        style = MaterialTheme.typography.bodyLarge
                    )
                }
            }
        }
    }
}

private fun sortFiles(files: List<FileMeta>, sortKey: SortKey, sortOrder: SortOrder): List<FileMeta> {
    return files.sortedWith { a, b ->
        val result = when (sortKey) {
            SortKey.NAME -> a.name.compareTo(b.name, ignoreCase = true)
            SortKey.SIZE -> a.size.compareTo(b.size)
            SortKey.LAST_MODIFIED -> a.lastModified.compareTo(b.lastModified)
            SortKey.STARRED -> a.starred.compareTo(b.starred)
            SortKey.TYPE -> {
                val aType = a.name.substringAfterLast('.', "").lowercase()
                val bType = b.name.substringAfterLast('.', "").lowercase()
                aType.compareTo(bType)
            }
        }
        if (sortOrder == SortOrder.ASC) result else -result
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

private fun formatDate(timestamp: Long): String {
    if (timestamp == 0L) return "Unknown"
    val date = java.util.Date(timestamp)
    val formatter = java.text.SimpleDateFormat("MMM dd, yyyy HH:mm", java.util.Locale.getDefault())
    return formatter.format(date)
}


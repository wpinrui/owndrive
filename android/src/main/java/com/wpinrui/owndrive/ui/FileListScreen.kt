package com.wpinrui.owndrive.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.storage.FirebaseStorage
import com.wpinrui.owndrive.FileActions
import com.wpinrui.owndrive.FileMeta
import com.wpinrui.owndrive.SettingsManager
import com.wpinrui.owndrive.SortKey
import com.wpinrui.owndrive.SortOrder
import com.wpinrui.owndrive.ui.utils.sortFiles
import kotlinx.coroutines.launch

@Composable
fun FileListScreen(
    onSettingsClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    var files by remember { mutableStateOf<List<FileMeta>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }

    // Sort preferences
    var sortKey by remember { mutableStateOf(SettingsManager.getSortKey(context)) }
    var sortOrder by remember { mutableStateOf(SettingsManager.getSortOrder(context)) }
    var showStarredFirst by remember { mutableStateOf(SettingsManager.getShowStarredFirst(context)) }
    var showSortMenu by remember { mutableStateOf(false) }

    // Selection state
    var selectedIds by remember { mutableStateOf<Set<String>>(emptySet()) }
    val isMultiSelectMode = selectedIds.size > 1
    val isSingleSelectMode = selectedIds.size == 1

    LaunchedEffect(Unit) {
        try {
            val db = FirebaseFirestore.getInstance()
            db.collection("files")
                .addSnapshotListener { snapshot, e ->
                    if (e != null) {
                        error = "Error listening to files: ${e.message}"
                        isLoading = false
                        return@addSnapshotListener
                    }

                    if (snapshot != null) {
                        files = snapshot.documents.map { doc ->
                            val data = doc.data ?: emptyMap<String, Any>()
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
        } catch (e: IllegalStateException) {
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
            val newOrder = if (sortOrder == SortOrder.ASC) SortOrder.DESC else SortOrder.ASC
            sortOrder = newOrder
            SettingsManager.saveSortOrder(context, newOrder)
        } else {
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
        // Show BulkActionsToolbar when any files are selected, otherwise show header
        if (selectedIds.isNotEmpty()) {
            BulkActionsToolbar(
                selectedCount = selectedIds.size,
                onDownload = {
                    val selectedFiles = displayedFiles.filter { file ->
                        file.id in selectedIds
                    }
                    scope.launch {
                        try {
                            val storage = FirebaseStorage.getInstance()
                            selectedFiles.forEach { file ->
                                FileActions.downloadFile(context, storage, file)
                            }
                        } catch (e: Exception) {
                            error = "Download failed: ${e.message}"
                        }
                    }
                    selectedIds = emptySet()
                },
                onDelete = {
                    val selectedFiles = displayedFiles.filter { file ->
                        file.id in selectedIds
                    }
                    val filesToDelete = selectedFiles.filter { file ->
                        !file.starred
                    }
                    if (filesToDelete.isEmpty()) {
                        error = "Cannot delete starred files"
                        return@BulkActionsToolbar
                    }
                    scope.launch {
                        try {
                            val db = FirebaseFirestore.getInstance()
                            val storage = FirebaseStorage.getInstance()
                            filesToDelete.forEach { file ->
                                FileActions.deleteFile(db, storage, file)
                            }
                            selectedIds = emptySet()
                        } catch (e: Exception) {
                            error = "Delete failed: ${e.message}"
                        }
                    }
                },
                onToggleStar = {
                    val selectedFiles = displayedFiles.filter { file ->
                        file.id in selectedIds
                    }
                    scope.launch {
                        try {
                            val db = FirebaseFirestore.getInstance()
                            selectedFiles.forEach { file ->
                                FileActions.toggleStar(db, file)
                            }
                            selectedIds = emptySet()
                        } catch (e: Exception) {
                            error = "Star toggle failed: ${e.message}"
                        }
                    }
                },
                onCancel = {
                    selectedIds = emptySet()
                }
            )
        } else {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .heightIn(min = 48.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "OwnDrive",
                    style = MaterialTheme.typography.headlineMedium,
                    color = MaterialTheme.colorScheme.onBackground
                )

                Row {
                    Box {
                        IconButton(onClick = { showSortMenu = true }) {
                            Icon(
                                imageVector = Icons.Default.MoreVert,
                                contentDescription = "Sort options",
                                tint = MaterialTheme.colorScheme.onBackground
                            )
                        }

                        SortMenu(
                            sortKey = sortKey,
                            sortOrder = sortOrder,
                            showStarredFirst = showStarredFirst,
                            expanded = showSortMenu,
                            onDismissRequest = { showSortMenu = false },
                            onSortKeySelected = { handleSort(it) },
                            onToggleStarredFirst = { toggleStarredFirst() }
                        )
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
                FileListErrorState(error = error!!)
            }

            displayedFiles.isEmpty() -> {
                FileListEmptyState()
            }

            else -> {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(displayedFiles) { file ->
                        val isSelected = file.id in selectedIds
                        FileItem(
                            file = file,
                            isSelected = isSelected,
                            isMultiSelectMode = isMultiSelectMode,
                            onItemClick = {
                                if (selectedIds.size > 1) {
                                    selectedIds = if (isSelected) {
                                        selectedIds - file.id
                                    } else {
                                        selectedIds + file.id
                                    }
                                } else if (selectedIds.size == 1 && isSelected) {
                                    selectedIds = emptySet()
                                } else if (selectedIds.size == 1 && !isSelected) {
                                    selectedIds = selectedIds + file.id
                                } else {
                                    selectedIds = setOf(file.id)
                                }
                            },
                            onDownload = {
                                scope.launch {
                                    try {
                                        val storage = FirebaseStorage.getInstance()
                                        FileActions.downloadFile(context, storage, file)
                                    } catch (e: Exception) {
                                        error = "Download failed: ${e.message}"
                                    }
                                }
                                selectedIds = emptySet()
                            },
                            onDelete = {
                                if (file.starred) {
                                    error = "Cannot delete starred files"
                                    return@FileItem
                                }
                                scope.launch {
                                    try {
                                        val db = FirebaseFirestore.getInstance()
                                        val storage = FirebaseStorage.getInstance()
                                        FileActions.deleteFile(db, storage, file)
                                        selectedIds = emptySet()
                                    } catch (e: Exception) {
                                        error = "Delete failed: ${e.message}"
                                    }
                                }
                            },
                            onToggleStar = {
                                scope.launch {
                                    try {
                                        val db = FirebaseFirestore.getInstance()
                                        FileActions.toggleStar(db, file)
                                        selectedIds = emptySet()
                                    } catch (e: Exception) {
                                        error = "Star toggle failed: ${e.message}"
                                    }
                                }
                            }
                        )
                    }
                }
            }
        }
    }
}



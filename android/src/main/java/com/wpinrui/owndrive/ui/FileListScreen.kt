package com.wpinrui.owndrive.ui

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.net.Uri
import android.Manifest
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
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
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExtendedFloatingActionButton
import androidx.compose.material3.FloatingActionButton
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
import java.io.File
import java.text.SimpleDateFormat
import java.util.*

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
    
    // Upload state
    var showCameraNameDialog by remember { mutableStateOf(false) }
    var showNoteNameDialog by remember { mutableStateOf(false) }
    var cameraImageUri by remember { mutableStateOf<Uri?>(null) }
    var noteContent by remember { mutableStateOf("") }
    var isUploading by remember { mutableStateOf(false) }
    
    // Generate default file names
    fun getDefaultCameraFileName(): String {
        val sdf = SimpleDateFormat("yyyy-MM-dd_HH-mm-ss", Locale.US)
        return "${sdf.format(Date())}.jpg"
    }
    
    fun getDefaultNoteFileName(): String {
        val sdf = SimpleDateFormat("yyyy-MM-dd_HH-mm-ss", Locale.US)
        return "${sdf.format(Date())}.txt"
    }
    
    // Get clipboard content
    fun getClipboardText(): String {
        val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as? ClipboardManager
        val clip = clipboard?.primaryClip
        return if (clip != null && clip.itemCount > 0) {
            clip.getItemAt(0)?.text?.toString() ?: ""
        } else {
            ""
        }
    }
    
    // Helper function to get file name from URI
    fun getFileNameFromUri(context: Context, uri: Uri): String? {
        var result: String? = null
        if (uri.scheme == "content") {
            val cursor = context.contentResolver.query(uri, null, null, null, null)
            cursor?.use {
                if (it.moveToFirst()) {
                    val nameIndex = it.getColumnIndex(android.provider.OpenableColumns.DISPLAY_NAME)
                    if (nameIndex >= 0) {
                        result = it.getString(nameIndex)
                    }
                }
            }
        }
        if (result == null) {
            result = uri.path?.let {
                val cut = it.lastIndexOf('/')
                if (cut != -1) {
                    it.substring(cut + 1)
                } else {
                    it
                }
            }
        }
        return result
    }
    
    // File picker launcher
    val filePickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        uri?.let {
            scope.launch {
                try {
                    isUploading = true
                    val fileName = getFileNameFromUri(context, it) ?: "file_${System.currentTimeMillis()}"
                    val db = FirebaseFirestore.getInstance()
                    val storage = FirebaseStorage.getInstance()
                    FileActions.uploadFile(context, db, storage, it, fileName)
                    isUploading = false
                } catch (e: Exception) {
                    error = "Upload failed: ${e.message}"
                    isUploading = false
                }
            }
        }
    }
    
    // Create camera image URI - must be defined before it's used
    fun createCameraImageUri(): Uri? {
        return try {
            val imageFile = File(context.cacheDir, "camera_image_${System.currentTimeMillis()}.jpg")
            // Ensure parent directory exists
            imageFile.parentFile?.mkdirs()
            // Create empty file
            imageFile.createNewFile()
            androidx.core.content.FileProvider.getUriForFile(
                context,
                "${context.packageName}.fileprovider",
                imageFile
            )
        } catch (e: Exception) {
            error = "Failed to create camera file: ${e.message}"
            null
        }
    }
    
    // Camera launcher - must be defined before permission launcher uses it
    val cameraLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.TakePicture()
    ) { success ->
        if (success) {
            cameraImageUri?.let {
                showCameraNameDialog = true
            }
        }
    }
    
    // Camera permission launcher - can now reference createCameraImageUri and cameraLauncher
    val cameraPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) {
            val uri = createCameraImageUri()
            if (uri != null) {
                cameraImageUri = uri
                cameraLauncher.launch(uri)
            } else {
                error = "Failed to create camera file"
            }
        } else {
            error = "Camera permission is required to take photos"
        }
    }

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
    
    // Dialogs
    if (showCameraNameDialog && cameraImageUri != null) {
        FileNameDialog(
            title = "Name your photo",
            defaultFileName = getDefaultCameraFileName(),
            onDismiss = {
                showCameraNameDialog = false
                cameraImageUri = null
            },
            onConfirm = { fileName ->
                showCameraNameDialog = false
                cameraImageUri?.let { uri ->
                    scope.launch {
                        try {
                            isUploading = true
                            val db = FirebaseFirestore.getInstance()
                            val storage = FirebaseStorage.getInstance()
                            FileActions.uploadFile(context, db, storage, uri, fileName)
                            isUploading = false
                            cameraImageUri = null
                        } catch (e: Exception) {
                            error = "Upload failed: ${e.message}"
                            isUploading = false
                            cameraImageUri = null
                        }
                    }
                }
            }
        )
    }
    
    if (showNoteNameDialog) {
        NoteDialog(
            title = "Create note",
            defaultFileName = getDefaultNoteFileName(),
            defaultContent = noteContent,
            onDismiss = {
                showNoteNameDialog = false
                noteContent = ""
            },
            onConfirm = { fileName, content ->
                showNoteNameDialog = false
                scope.launch {
                    try {
                        isUploading = true
                        val db = FirebaseFirestore.getInstance()
                        val storage = FirebaseStorage.getInstance()
                        val bytes = content.toByteArray(Charsets.UTF_8)
                        FileActions.uploadBytes(db, storage, bytes, fileName)
                        isUploading = false
                        noteContent = ""
                    } catch (e: Exception) {
                        error = "Upload failed: ${e.message}"
                        isUploading = false
                        noteContent = ""
                    }
                }
            }
        )
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
                            imageVector = Icons.Filled.MoreVert,
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
                            imageVector = Icons.Filled.Settings,
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
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth(),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator()
                }
            }

            error != null -> {
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth()
                ) {
                    FileListErrorState(error = error!!)
                }
            }

            displayedFiles.isEmpty() -> {
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth()
                ) {
                    FileListEmptyState()
                }
            }

            else -> {
                LazyColumn(
                    modifier = Modifier.weight(1f),
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
        
        // Upload button group at the bottom
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Camera button (small)
            FloatingActionButton(
                onClick = {
                    // Check and request camera permission first
                    when {
                        ContextCompat.checkSelfPermission(
                            context,
                            Manifest.permission.CAMERA
                        ) == android.content.pm.PackageManager.PERMISSION_GRANTED -> {
                            // Permission already granted, proceed with camera
                            val uri = createCameraImageUri()
                            if (uri != null) {
                                cameraImageUri = uri
                                cameraLauncher.launch(uri)
                            }
                        }
                        else -> {
                            // Request permission
                            cameraPermissionLauncher.launch(Manifest.permission.CAMERA)
                        }
                    }
                },
                modifier = Modifier.size(56.dp),
                containerColor = MaterialTheme.colorScheme.secondaryContainer
            ) {
                Icon(
                    imageVector = Icons.Filled.CameraAlt,
                    contentDescription = "Take photo",
                    modifier = Modifier.size(24.dp)
                )
            }
            
            // Note button (small)
            FloatingActionButton(
                onClick = {
                    noteContent = getClipboardText()
                    showNoteNameDialog = true
                },
                modifier = Modifier.size(56.dp),
                containerColor = MaterialTheme.colorScheme.secondaryContainer
            ) {
                Icon(
                    imageVector = Icons.Filled.Note,
                    contentDescription = "Create note",
                    modifier = Modifier.size(24.dp)
                )
            }
            
            // Upload file button (larger, extended FAB)
            ExtendedFloatingActionButton(
                onClick = { 
                    if (!isUploading) {
                        filePickerLauncher.launch("*/*")
                    }
                },
                modifier = Modifier.weight(1f),
                containerColor = MaterialTheme.colorScheme.primaryContainer,
                contentColor = MaterialTheme.colorScheme.onPrimaryContainer
            ) {
                if (isUploading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(20.dp),
                        color = MaterialTheme.colorScheme.onPrimaryContainer
                    )
                } else {
                    Icon(
                        imageVector = Icons.Filled.Upload,
                        contentDescription = "Upload file",
                        modifier = Modifier.size(20.dp)
                    )
                }
                Spacer(modifier = Modifier.width(8.dp))
                Text("Upload")
            }
        }
    }
}



package com.wpinrui.owndrive.ui.utils

import com.wpinrui.owndrive.FileMeta
import com.wpinrui.owndrive.SortKey
import com.wpinrui.owndrive.SortOrder

fun sortFiles(files: List<FileMeta>, sortKey: SortKey, sortOrder: SortOrder): List<FileMeta> {
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

fun formatFileSize(bytes: Long): String {
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

fun formatDate(timestamp: Long): String {
    if (timestamp == 0L) return "Unknown"
    val date = java.util.Date(timestamp)
    val formatter = java.text.SimpleDateFormat("MMM dd, yyyy HH:mm", java.util.Locale.getDefault())
    return formatter.format(date)
}


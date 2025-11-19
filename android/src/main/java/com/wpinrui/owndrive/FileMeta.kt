package com.wpinrui.owndrive

data class FileMeta(
    val id: String = "",
    val name: String = "",
    val size: Long = 0L,
    val lastModified: Long = 0L,
    val starred: Boolean = false,
    val uploadedAt: Long = 0L,
    val storagePath: String = ""
)


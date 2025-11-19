package com.wpinrui.owndrive

import android.content.Context
import android.net.Uri
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.storage.FirebaseStorage
import kotlinx.coroutines.tasks.await
import java.io.InputStream
import java.text.SimpleDateFormat
import java.util.*

object FileActions {
    suspend fun toggleStar(db: FirebaseFirestore, file: FileMeta) {
        // Use id (which is the document ID, same as name)
        val fileDoc = db.collection("files").document(file.id.ifEmpty { file.name })
        fileDoc.update("starred", !file.starred).await()
    }
    
    suspend fun deleteFile(db: FirebaseFirestore, storage: FirebaseStorage, file: FileMeta) {
        // Delete from storage
        if (file.storagePath.isNotEmpty()) {
            try {
                val storageRef = storage.reference.child(file.storagePath)
                storageRef.delete().await()
            } catch (e: Exception) {
                // If storage deletion fails, still try to delete from Firestore
                // Log error but continue
            }
        }
        // Delete from Firestore - use id (which is the document ID, same as name)
        val fileDoc = db.collection("files").document(file.id.ifEmpty { file.name })
        fileDoc.delete().await()
    }
    
    suspend fun getDownloadUrl(storage: FirebaseStorage, file: FileMeta): String {
        val storageRef = storage.reference.child(file.storagePath)
        return storageRef.downloadUrl.await().toString()
    }
    
    suspend fun downloadFile(context: Context, storage: FirebaseStorage, file: FileMeta) {
        val url = getDownloadUrl(storage, file)
        // Open URL in browser or download manager
        val intent = android.content.Intent(android.content.Intent.ACTION_VIEW, Uri.parse(url))
        intent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK)
        context.startActivity(intent)
    }
    
    suspend fun uploadFile(
        context: Context,
        db: FirebaseFirestore,
        storage: FirebaseStorage,
        uri: Uri,
        fileName: String,
        onProgress: ((Int) -> Unit)? = null
    ) {
        // Read file from URI
        val inputStream: InputStream? = context.contentResolver.openInputStream(uri)
        if (inputStream == null) {
            throw Exception("Failed to open file")
        }
        
        val bytes = inputStream.readBytes()
        inputStream.close()
        
        // Generate storage path with timestamp
        val timestamp = formatTimestamp(System.currentTimeMillis())
        val dotIndex = fileName.lastIndexOf(".")
        val baseName = if (dotIndex != -1) fileName.substring(0, dotIndex) else fileName
        val extension = if (dotIndex != -1) fileName.substring(dotIndex) else ""
        val storageId = "${baseName}-${timestamp}${extension}"
        
        // Upload to Firebase Storage
        val storageRef = storage.reference.child(storageId)
        val uploadTask = storageRef.putBytes(bytes)
        
        // Track upload progress if callback provided
        if (onProgress != null) {
            uploadTask.addOnProgressListener { taskSnapshot ->
                val progress = ((100.0 * taskSnapshot.bytesTransferred) / taskSnapshot.totalByteCount).toInt()
                onProgress(progress)
            }
        }
        
        uploadTask.await()
        
        // Update Firestore
        val fileDoc = db.collection("files").document(fileName)
        val fileData = hashMapOf(
            "id" to storageId,
            "name" to fileName,
            "size" to bytes.size.toLong(),
            "lastModified" to System.currentTimeMillis(),
            "starred" to false,
            "uploadedAt" to System.currentTimeMillis(),
            "storagePath" to storageId
        )
        fileDoc.set(fileData).await()
    }
    
    suspend fun uploadBytes(
        db: FirebaseFirestore,
        storage: FirebaseStorage,
        bytes: ByteArray,
        fileName: String,
        onProgress: ((Int) -> Unit)? = null
    ) {
        // Generate storage path with timestamp
        val timestamp = formatTimestamp(System.currentTimeMillis())
        val dotIndex = fileName.lastIndexOf(".")
        val baseName = if (dotIndex != -1) fileName.substring(0, dotIndex) else fileName
        val extension = if (dotIndex != -1) fileName.substring(dotIndex) else ""
        val storageId = "${baseName}-${timestamp}${extension}"
        
        // Upload to Firebase Storage
        val storageRef = storage.reference.child(storageId)
        val uploadTask = storageRef.putBytes(bytes)
        
        // Track upload progress if callback provided
        if (onProgress != null) {
            uploadTask.addOnProgressListener { taskSnapshot ->
                val progress = ((100.0 * taskSnapshot.bytesTransferred) / taskSnapshot.totalByteCount).toInt()
                onProgress(progress)
            }
        }
        
        uploadTask.await()
        
        // Update Firestore
        val fileDoc = db.collection("files").document(fileName)
        val fileData = hashMapOf(
            "id" to storageId,
            "name" to fileName,
            "size" to bytes.size.toLong(),
            "lastModified" to System.currentTimeMillis(),
            "starred" to false,
            "uploadedAt" to System.currentTimeMillis(),
            "storagePath" to storageId
        )
        fileDoc.set(fileData).await()
    }
    
    private fun formatTimestamp(timestamp: Long): String {
        val sdf = SimpleDateFormat("yyyy-MM-dd_HH-mm-ss", Locale.US)
        return sdf.format(Date(timestamp))
    }
}


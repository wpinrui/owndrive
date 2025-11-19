package com.wpinrui.owndrive

import android.content.Context
import android.net.Uri
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.storage.FirebaseStorage
import kotlinx.coroutines.tasks.await

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
}


import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';
import { compressImage } from '../utils/imageCompressor';

/**
 * Compresses an evidence photo and uploads it to Firebase Storage.
 * Falls back to compressed WebP data URL if Cloud Storage upload is unavailable.
 */
export async function uploadEvidencePhoto(
  file: File,
  userId: string,
  badgeId: string
): Promise<string> {
  // 1. Compress image to max 1024x1024, quality 0.8 (< 40KB)
  const compressedDataUrl = await compressImage(file, 1024, 1024, 0.8);

  // 2. Attempt upload to Firebase Storage for permanent public cloud URL
  try {
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const path = `evidence/${userId}/${badgeId}/${Date.now()}_${cleanFileName}`;
    const storageRef = ref(storage, path);

    await uploadString(storageRef, compressedDataUrl, 'data_url');
    const downloadUrl = await getDownloadURL(storageRef);
    console.log('[Storage] Successfully uploaded evidence to Cloud Storage:', downloadUrl);
    return downloadUrl;
  } catch (err) {
    console.warn('[Storage] Firebase Storage upload notice (using compressed WebP data URI directly):', err);
    // Fallback: The compressed WebP data URL is tiny and permanently stored in Firestore cb_user_progress
    return compressedDataUrl;
  }
}

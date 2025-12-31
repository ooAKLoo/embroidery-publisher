import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const R2_ACCOUNT_ID = import.meta.env.VITE_R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = import.meta.env.VITE_R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = import.meta.env.VITE_R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = import.meta.env.VITE_R2_BUCKET_NAME || '31-north';
const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL;

// Initialize S3 client for R2
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Upload a single image to R2
 * @param {File} file - The file to upload
 * @param {string} folder - The folder path (default: 'products')
 * @returns {Promise<{url: string, key: string}>}
 */
export async function uploadImage(file, folder = 'products') {
  const timestamp = Date.now();
  const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '-');
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const key = `${folder}/${timestamp}-${cleanName}.${extension}`;

  // Convert File to ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();

  // Upload to R2
  await r2Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: new Uint8Array(arrayBuffer),
      ContentType: file.type || 'image/jpeg',
      CacheControl: 'public, max-age=31536000',
    })
  );

  return {
    url: `${R2_PUBLIC_URL}/${key}`,
    key,
  };
}

/**
 * Upload multiple images to R2
 * @param {File[]} files - Array of files to upload
 * @param {string} folder - The folder path
 * @param {function} onProgress - Progress callback (index, total)
 * @returns {Promise<Array<{url: string, key: string}>>}
 */
export async function uploadImages(files, folder = 'products', onProgress) {
  const results = [];

  for (let i = 0; i < files.length; i++) {
    const result = await uploadImage(files[i], folder);
    results.push(result);
    onProgress?.(i + 1, files.length);
  }

  return results;
}

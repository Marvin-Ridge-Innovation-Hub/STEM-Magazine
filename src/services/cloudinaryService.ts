import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Extract the public ID from a Cloudinary URL
 * URL format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{folder}/{public_id}.{format}
 */
export function extractPublicId(url: string): string | null {
  try {
    // Check if it's a Cloudinary URL
    if (!url.includes('cloudinary.com')) {
      return null;
    }

    // Parse the URL to get the path
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');

    // Find the index of 'upload' and get everything after it
    const uploadIndex = pathParts.indexOf('upload');
    if (uploadIndex === -1) {
      return null;
    }

    // Get parts after 'upload', skipping the version (v1234567890)
    const afterUpload = pathParts.slice(uploadIndex + 1);

    // Skip version if present (starts with 'v' followed by numbers)
    let startIndex = 0;
    if (afterUpload[0] && /^v\d+$/.test(afterUpload[0])) {
      startIndex = 1;
    }

    // Join remaining parts and remove file extension
    const publicIdWithExtension = afterUpload.slice(startIndex).join('/');
    const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, '');

    return publicId || null;
  } catch (error) {
    console.error('Error extracting public ID from URL:', url, error);
    return null;
  }
}

/**
 * Delete a single image from Cloudinary
 */
export async function deleteImage(url: string): Promise<boolean> {
  const publicId = extractPublicId(url);
  if (!publicId) {
    console.warn('Could not extract public ID from URL:', url);
    return false;
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', publicId, error);
    return false;
  }
}

/**
 * Delete multiple images from Cloudinary
 */
export async function deleteImages(
  urls: string[]
): Promise<{ deleted: number; failed: number }> {
  let deleted = 0;
  let failed = 0;

  for (const url of urls) {
    const success = await deleteImage(url);
    if (success) {
      deleted++;
    } else {
      failed++;
    }
  }

  return { deleted, failed };
}

/**
 * Delete all images associated with a post or submission
 * Takes thumbnail URL and optional array of additional images
 */
export async function deletePostImages(
  thumbnailUrl?: string | null,
  images?: string[]
): Promise<void> {
  const urlsToDelete: string[] = [];

  if (thumbnailUrl) {
    urlsToDelete.push(thumbnailUrl);
  }

  if (images && images.length > 0) {
    // Filter out duplicates (thumbnail might be same as first image)
    for (const img of images) {
      if (!urlsToDelete.includes(img)) {
        urlsToDelete.push(img);
      }
    }
  }

  if (urlsToDelete.length > 0) {
    const result = await deleteImages(urlsToDelete);
    console.log(`Deleted ${result.deleted} images, ${result.failed} failed`);
  }
}

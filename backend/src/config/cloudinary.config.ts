import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create Cloudinary storage for multer
export function createCloudinaryStorage(folderName: string) {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
      return {
        folder: `hotel-booking/${folderName}`,
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1200, height: 800, crop: 'limit' }],
        public_id: `${folderName}-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
      };
    },
  });
}

// Helper to delete image from Cloudinary
export async function deleteCloudinaryImage(imageUrl: string): Promise<void> {
  try {
    // Extract public_id from Cloudinary URL
    // URL format: https://res.cloudinary.com/cloud_name/image/upload/v123/folder/public_id.ext
    const urlParts = imageUrl.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    if (uploadIndex === -1) return;

    // Get everything after 'upload/v123/' and remove extension
    const pathAfterUpload = urlParts.slice(uploadIndex + 2).join('/');
    const publicId = pathAfterUpload.replace(/\.[^/.]+$/, '');

    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting Cloudinary image:', error);
  }
}

export { cloudinary };

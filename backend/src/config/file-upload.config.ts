import { diskStorage } from 'multer';
import { extname } from 'path';
import { createCloudinaryStorage } from './cloudinary.config';

const isProduction = process.env.NODE_ENV === 'production';

// Local disk storage for development
function createLocalStorage(folderName: string) {
  return diskStorage({
    destination: `./uploads/${folderName}`,
    filename: (req, file, callback) => {
      const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const extension = extname(file.originalname);
      callback(null, `${folderName}-${uniqueName}${extension}`);
    },
  });
}

export function createUploadConfig(folderName: string) {
  return {
    storage: isProduction
      ? createCloudinaryStorage(folderName)
      : createLocalStorage(folderName),
    limits: {
      fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (
      req: Express.Request,
      file: Express.Multer.File,
      callback: (error: Error | null, acceptFile: boolean) => void,
    ) => {
      const allowedTypes = /\.(jpg|jpeg|png|webp)$/i;
      if (!allowedTypes.test(file.originalname)) {
        return callback(new Error('Only image files are allowed!'), false);
      }
      callback(null, true);
    },
  };
}

// Helper to get file path/URL from uploaded file
// Cloudinary: file.path contains full URL
// Local: construct path from filename
export function getFilePath(
  file: Express.Multer.File,
  folderName: string,
): string {
  if (isProduction && file.path) {
    return file.path; // Cloudinary returns full URL in path
  }
  return `/uploads/${folderName}/${file.filename}`;
}

export const hotelUploadConfig = createUploadConfig('hotels');
export const roomUploadConfig = createUploadConfig('rooms');
export const profileUploadConfig = createUploadConfig('profiles');

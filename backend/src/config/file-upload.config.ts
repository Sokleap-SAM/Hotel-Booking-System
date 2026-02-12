import { diskStorage } from 'multer';
import { extname } from 'path';

export function createUploadConfig(folderName: string) {
  return {
    storage: diskStorage({
      destination: `./uploads/${folderName}`,
      filename: (req, file, callback) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const extension = extname(file.originalname);
        callback(null, `${folderName}-${uniqueName}${extension}`);
      },
    }),
    limits: {
      fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (
      req: Express.Request,
      file: Express.Multer.File,
      callback: (error: Error | null, acceptFile: boolean) => void,
    ) => {
      const allowedTypes = /\.(jpg|jpeg|png)$/i;
      if (!allowedTypes.test(file.originalname)) {
        return callback(new Error('Only image files are allowed!'), false);
      }
      callback(null, true);
    },
  };
}

export const hotelUploadConfig = createUploadConfig('hotels');
export const roomUploadConfig = createUploadConfig('rooms');
export const profileUploadConfig = createUploadConfig('profiles');

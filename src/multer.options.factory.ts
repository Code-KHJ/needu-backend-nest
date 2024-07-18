import { S3Client } from '@aws-sdk/client-s3';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import multerS3 from 'multer-s3';
import { basename, extname } from 'path';

export const multerOptionsFactory = (): MulterOptions => {
  return {
    storage: multerS3({
      s3: new S3Client({
        region: process.env.AWS_S3_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      }),
      bucket: process.env.AWS_S3_BUCKET,
      acl: '',
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key(_req, file, callback) {
        const fileType = file.mimetype.split('/')[0];
        const ext = extname(file.originalname);
        const baseName = basename(file.originalname, ext);
        const fileName = fileType === 'video' ? `videos/${baseName}-${Date.now()}${ext}` : `images/${baseName}-${Date.now()}${ext}`;
        callback(null, fileName);
      },
    }),
    limits: {
      fileSize: 5 * 1024 * 1024,
    },
  };
};

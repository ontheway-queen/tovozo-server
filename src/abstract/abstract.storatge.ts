import { S3Client } from '@aws-sdk/client-s3';
import { allowAllFileTypes } from '../middleware/uploader/uploaderConstants';
import config from '../app/config';

abstract class CommonAbstractStorage {
  protected allowed_file_types: string[];
  protected error_message: string;

  constructor() {
    this.allowed_file_types = allowAllFileTypes;
    this.error_message = 'Only .jpg, .jpeg, .webp or .png format allowed!';
  }

  // aws s3 connect
  protected s3Client: S3Client = new S3Client({
    region: 'ap-south-1',
    credentials: {
      accessKeyId: config.AWS_S3_ACCESS_KEY,
      secretAccessKey: config.AWS_S3_SECRET_KEY,
    },
  });
}

export default CommonAbstractStorage;

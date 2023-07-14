import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';

@Injectable()
export class S3Service {
  private s3: AWS.S3;

  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
  }

  async upload(data: Buffer, key: string) {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: 'documents/' + String(key),
      Body: data,
      ContentEncoding: 'base64',
      ACL: 'public-read',
    };
    const result = await this.s3.upload(params).promise();
    return result;
  }

  async delete(key: string) {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: 'documents/' + String(key),
    };
    const result = await this.s3.deleteObject(params).promise();
    return result;
  }

  async getFolderCapacity(
    bucketName: string,
    folderPath: string
  ): Promise<number> {
    const params = {
      Bucket: bucketName,
      Prefix: folderPath,
    };
    try {
      const data = await this.s3.listObjectsV2(params).promise();
      const files = data.Contents;
      const sizes = files.map((file) => file.Size);
      const folderCapacity = sizes.reduce((acc, curr) => acc + curr, 0);
      return folderCapacity;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

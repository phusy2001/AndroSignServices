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
      Key: String(key),
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
      Key: String(key),
    };
    const result = await this.s3.deleteObject(params).promise();
    return result;
  }
}

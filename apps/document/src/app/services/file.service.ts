import { Injectable } from '@nestjs/common';
import { File, FileDocument } from '../schemas/file.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';

@Injectable()
export class FileService {
  constructor(@InjectModel(File.name) private fileModel: Model<FileDocument>) {}

  async create(file: File): Promise<File> {
    const newFile = new this.fileModel(file);
    return newFile.save();
  }

  async updatePathById(id: string, filePath: string) {
    return await this.fileModel.findByIdAndUpdate(id, {
      path: filePath,
    });
  }

  async getOwnFilesByUserId(userId: string, offset: number) {
    const numLimit = 10;
    return await this.fileModel
      .find(
        { user: null, deleted: false },
        {
          _id: 1,
          name: 1,
          path: 1,
          updated_at: 1,
        }
      )
      .limit(numLimit)
      .skip((offset - 1) * numLimit)
      .sort({ updated_at: 'desc' });
  }

  async getFileXfdf(fileId: string) {
    return await this.fileModel.findById(fileId, 'xfdf');
  }

  async updateXfdfById(id: string, xfdf: string) {
    return await this.fileModel.findByIdAndUpdate(id, {
      xfdf: xfdf,
    });
  }

  async deleteFile(id: string) {
    return await this.fileModel.findByIdAndUpdate(id, {
      deleted: true,
    });
  }
}

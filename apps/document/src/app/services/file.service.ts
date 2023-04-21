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

  async updateById(id: String, filePath: String) {
    return await this.fileModel.findByIdAndUpdate(id, {
      path: filePath,
    });
  }

  async getOwnFilesByUserId(userId: String) {
    return await this.fileModel.find(
      {},
      {
        _id: 1,
        name: 1,
        path: 1,
        updated_at: 1,
      }
    );
  }

  async getFileXfdf(fileId: String) {
    return await this.fileModel.findById(fileId, 'xfdf');
  }
}

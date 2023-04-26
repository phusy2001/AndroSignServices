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

  async getOwnFilesByUserId(
    userId: string,
    offset: number,
    keyword: string,
    sort: string,
    order: string
  ) {
    const numLimit = 10;
    const query = this.fileModel.find(
      { user: userId, deleted: false },
      {
        _id: 1,
        name: 1,
        path: 1,
        updated_at: 1,
      }
    );
    if (keyword !== '') query.find({ $text: { $search: keyword } });
    query.limit(numLimit);
    query.skip((offset - 1) * numLimit);
    if (sort === 'updated')
      query.sort({ updated_at: `${order === 'asc' ? 'asc' : 'desc'}` });
    else if (sort === 'name')
      query.sort({ name: `${order === 'asc' ? 'asc' : 'desc'}` });
    else if (sort === 'created')
      query.sort({ created_at: `${order === 'asc' ? 'asc' : 'desc'}` });
    return await query.exec();
  }

  async getFileXfdf(fileId: string) {
    return await this.fileModel.findById(fileId, 'xfdf');
  }

  async updateXfdfById(id: string, xfdf: string) {
    return await this.fileModel.findByIdAndUpdate(id, {
      xfdf: xfdf,
      updated_at: new Date(),
    });
  }

  async deleteFile(id: string) {
    return await this.fileModel.findByIdAndUpdate(id, {
      deleted: true,
    });
  }

  async addUserToSharedFile(userId: string, fileId: string) {
    return await this.fileModel.findByIdAndUpdate(fileId, {
      $addToSet: { sharedTo: userId },
    });
  }

  async deleteUserFromSharedFile(userId: string, fileId: string) {
    return await this.fileModel.findByIdAndUpdate(fileId, {
      $pull: { sharedTo: userId },
    });
  }

  async getFileUserShared(id: string, offset: number) {
    const numLimit = 10;
    return await this.fileModel.findById(id, {
      sharedTo: { $slice: [(offset - 1) * numLimit, numLimit] },
    });
  }

  async getFileSharedByUserId(id: string) {
    return await this.fileModel.find(
      { sharedTo: id },
      {
        _id: 1,
        name: 1,
        path: 1,
        updated_at: 1,
      }
    );
  }
}

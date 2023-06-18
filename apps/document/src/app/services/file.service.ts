import { Injectable } from '@nestjs/common';
import { File, FileDocument } from '../schemas/file.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

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
    order: string,
    status: string
  ) {
    const numLimit = 10;
    const query = this.fileModel.find({ user: userId, deleted: false }).select({
      fileStarred: {
        $cond: {
          if: { $in: [userId, '$starred'] },
          then: true,
          else: false,
        },
      },
      completed: {
        $cond: {
          if: { $eq: ['$stepIndex', '$stepTotal'] },
          then: true,
          else: false,
        },
      },
      total: 1,
      _id: 1,
      name: 1,
      stepUser: 1,
      path: 1,
      updated_at: 1,
    });
    if (keyword !== '') query.find({ $text: { $search: keyword } });
    if (status === 'completed')
      query.find({
        $expr: {
          $eq: ['$stepIndex', '$stepTotal'],
        },
      });
    else if (status === 'me') query.find({ stepUser: userId });
    else if (status === 'others')
      query.find({
        stepUser: { $nin: [userId, 'null'] },
      });
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
    return await this.fileModel.findById(fileId, {
      xfdf: 1,
      stepNow: 1,
      stepUser: 1,
    });
  }

  async updateXfdfById(
    id: string,
    xfdf: string,
    signed: number,
    stepNow: number,
    stepUser: string
  ) {
    return await this.fileModel.findByIdAndUpdate(
      id,
      {
        xfdf: xfdf,
        signed: signed,
        stepNow: stepNow,
        stepUser: stepUser,
        $inc: { stepIndex: 1 },
        updated_at: new Date(),
      },
      { new: true }
    );
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
      xfdf: 0,
    });
  }

  async getFilesSharedByUserId(
    userId: string,
    offset: number,
    keyword: string,
    sort: string,
    order: string,
    status: string
  ) {
    const numLimit = 10;
    const query = this.fileModel
      .find({ sharedTo: userId, deleted: false })
      .select({
        fileStarred: {
          $cond: {
            if: { $in: [userId, '$starred'] },
            then: true,
            else: false,
          },
        },
        completed: {
          $cond: {
            if: { $eq: ['$stepIndex', '$stepTotal'] },
            then: true,
            else: false,
          },
        },
        total: 1,
        _id: 1,
        name: 1,
        stepUser: 1,
        path: 1,
        updated_at: 1,
      });
    if (keyword !== '') query.find({ $text: { $search: keyword } });
    if (status === 'completed')
      query.find({
        $expr: {
          $eq: ['$stepIndex', '$stepTotal'],
        },
      });
    else if (status === 'me') query.find({ stepUser: userId });
    else if (status === 'others')
      query.find({
        stepUser: { $nin: [userId, 'null'] },
      });
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

  async getFilesByIdArray(idArr: Array<string>, userId: string) {
    return await this.fileModel
      .find({ _id: { $in: idArr }, deleted: false })
      .select({
        fileOwner: {
          $cond: {
            if: { $eq: ['$user', userId] },
            then: true,
            else: false,
          },
        },
        fileStarred: {
          $cond: {
            if: { $in: [userId, '$starred'] },
            then: true,
            else: false,
          },
        },
        completed: {
          $cond: {
            if: { $eq: ['$stepIndex', '$stepTotal'] },
            then: true,
            else: false,
          },
        },
        total: 1,
        _id: 1,
        name: 1,
        stepUser: 1,
        path: 1,
        updated_at: 1,
      });
  }

  async markFile(fileId: string, userId: string) {
    return await this.fileModel.findByIdAndUpdate(fileId, {
      $addToSet: { starred: userId },
    });
  }

  async unmarkFile(fileId: string, userId: string) {
    return await this.fileModel.findByIdAndUpdate(fileId, {
      $pull: { starred: userId },
    });
  }

  async getStarredFiles(
    userId: string,
    offset: number,
    keyword: string,
    sort: string,
    order: string,
    status: string
  ) {
    const numLimit = 10;
    const query = this.fileModel
      .find({ starred: userId, deleted: false })
      .select({
        fileOwner: {
          $cond: {
            if: { $eq: ['$user', userId] },
            then: true,
            else: false,
          },
        },
        completed: {
          $cond: {
            if: { $eq: ['$stepIndex', '$stepTotal'] },
            then: true,
            else: false,
          },
        },
        total: 1,
        _id: 1,
        name: 1,
        stepUser: 1,
        path: 1,
        updated_at: 1,
      });
    if (keyword !== '') query.find({ $text: { $search: keyword } });
    if (status === 'completed')
      query.find({
        $expr: {
          $eq: ['$stepIndex', '$stepTotal'],
        },
      });
    else if (status === 'me') query.find({ stepUser: userId });
    else if (status === 'others')
      query.find({
        stepUser: { $nin: [userId, 'null'] },
      });
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

  async getDeletedFiles(
    userId: string,
    offset: number,
    keyword: string,
    sort: string,
    order: string
  ) {
    const numLimit = 10;
    const query = this.fileModel.find({ deleted: true, user: userId }).select({
      _id: 1,
      name: 1,
      updated_at: 1,
    });
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

  async restoreFile(fileId: string) {
    return await this.fileModel.findByIdAndUpdate(fileId, {
      deleted: false,
    });
  }

  async deletePermanently(fileId: string) {
    return await this.fileModel.findByIdAndDelete(fileId);
  }

  async updateFileHistory(fileId: string, userId: string, action: string) {
    return await this.fileModel.findByIdAndUpdate(fileId, {
      $addToSet: {
        history: {
          user: userId,
          action,
          date: new Date(),
        },
      },
    });
  }

  async getFileHistory(id: string, offset: number) {
    const numLimit = 10;
    return await this.fileModel.findById(id, {
      history: { $slice: [(offset - 1) * numLimit, numLimit] },
      xfdf: 0,
    });
  }

  async renameFile(id: string, name: string) {
    return await this.fileModel.findByIdAndUpdate(id, { name: name });
  }
}

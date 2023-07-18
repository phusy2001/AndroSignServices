import { Injectable } from '@nestjs/common';
import { Folder, FolderDocument } from '../schemas/folder.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class FolderService {
  constructor(
    @InjectModel(Folder.name) private folderModel: Model<FolderDocument>
  ) {}

  async create(folder: Folder): Promise<Folder> {
    const newFolder = new this.folderModel(folder);
    return newFolder.save();
  }

  async getFoldersByUserId(
    userId: string,
    offset: number,
    keyword: string,
    sort: string,
    order: string
  ) {
    const numLimit = 10;
    const query = this.folderModel.find(
      { user: userId },
      {
        _id: 1,
        name: 1,
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

  async deleteFolder(folderId: string) {
    return await this.folderModel.findByIdAndDelete(folderId);
  }

  async getFilesIdByFolderId(folderId: string, offset: number) {
    const numLimit = 10;
    return await this.folderModel.findById(folderId, {
      files: { $slice: [(offset - 1) * numLimit, numLimit] },
    });
  }

  async checkFileInFolder(fileId: string, folderId: string) {
    return await this.folderModel.exists({ _id: folderId, files: fileId });
  }

  async addFileToFolder(fileId: string, folderId: string) {
    return await this.folderModel.findByIdAndUpdate(folderId, {
      $addToSet: { files: fileId },
    });
  }

  async removeFileFromFolder(fileId: string, folderId: string) {
    return await this.folderModel.findByIdAndUpdate(folderId, {
      $pull: { files: fileId },
    });
  }

  async getFolderListOfFile(fileId: string, offset: number, userId: string) {
    const numLimit = 10;
    return await this.folderModel
      .find({ user: userId })
      .select({
        isStored: {
          $cond: {
            if: { $in: [fileId, '$files'] },
            then: true,
            else: false,
          },
        },
        _id: 1,
        name: 1,
      })
      .limit(numLimit)
      .skip((offset - 1) * numLimit);
  }

  async findNameByUser(userId: string, name: string) {
    return await this.folderModel.findOne(
      { user: userId, name: name },
      { name: 1 }
    );
  }

  async renameFolder(id: string, name: string) {
    return await this.folderModel.findByIdAndUpdate(id, {
      name: name,
      updated_at: new Date(),
    });
  }
}

import {
  Controller,
  Get,
  Post,
  Res,
  Body,
  HttpStatus,
  UploadedFile,
  UseInterceptors,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { Multer } from 'multer';
import { AppService } from './app.service';
import { FileService } from './services/file.service';
import { File } from './schemas/file.schema';
import { S3Service } from './services/s3.service';
import { FolderService } from './services/folder.service';
import { AuthGuard } from './commons/guard/auth.guard';
import { UserId } from './commons/decorator/userid.decorator';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly fileService: FileService,
    private readonly folderService: FolderService,
    private readonly s3Service: S3Service
  ) {}

  @Post('/uploadFile')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Res() res,
    @UploadedFile() pdfFile: Express.Multer.File,
    @Body() body: File
  ) {
    const object = await this.fileService.create(body);
    const result = await this.s3Service.upload(
      pdfFile.buffer,
      object._id + '.pdf'
    );
    if (result) {
      await this.fileService.updatePathById(object._id, result.Location);
      return res.status(HttpStatus.OK).json({
        data: {},
        status: 'true',
        message: 'Upload File Successfully',
      });
    }
    return res.status(HttpStatus.OK).json({
      data: {},
      status: 'false',
      message: 'Upload File Failed',
    });
  }

  @Post('/deleteFile')
  async deleteFile(@Res() res, @Body() body) {
    // const result = await this.s3Service.delete(body.name + '.pdf');
    const result = await this.fileService.deleteFile(body.id);
    if (result) {
      return res.status(HttpStatus.OK).json({
        data: {},
        status: 'true',
        message: 'Deleted File Successfully',
      });
    }
    return res.status(HttpStatus.OK).json({
      data: {},
      status: 'false',
      message: 'Deleted File Failed',
    });
  }

  @Get('/getMyFiles')
  async getOwnFiles(
    @Res() res,
    @UserId() userId,
    @Query('offset') offset,
    @Query('sort') sort,
    @Query('status') status,
    @Query('keyword') keyword,
    @Query('order') order
  ) {
    // const userId = 'null';
    const objects = await this.fileService.getOwnFilesByUserId(
      userId,
      offset,
      keyword,
      sort,
      order
    );
    return res.status(HttpStatus.OK).json({
      data: {
        data: objects,
      },
      status: 'true',
      message: 'Get File Successfully',
    });
  }

  @Get('/getXfdf')
  async getFileXfdf(@Res() res, @Query('id') id) {
    const object = await this.fileService.getFileXfdf(id);
    return res.status(HttpStatus.OK).json({
      data: {
        data: object,
      },
      status: 'true',
      message: 'Get File Successfully',
    });
  }

  @Post('/editFile')
  async editFile(@Res() res, @Body() body) {
    const result = await this.fileService.updateXfdfById(
      body.id,
      body.xfdf,
      body.signed,
      body.completed,
      body.step,
      body.user
    );
    if (result) {
      return res.status(HttpStatus.OK).json({
        data: {},
        status: 'true',
        message: 'Update File Successfully',
      });
    }
    return res.status(HttpStatus.OK).json({
      data: {},
      status: 'false',
      message: 'Update File Failed',
    });
  }

  @Post('/addShared')
  async addUserToSharedFile(@Res() res, @Body() body) {
    const object = await this.appService.getIdByUserEmail(body.email);
    if (object.status === 'true') {
      const userId = object.data.uid;
      const result = await this.fileService.addUserToSharedFile(
        userId,
        body.id
      );
      if (result) {
        return res.status(HttpStatus.OK).json({
          data: {},
          status: 'true',
          message: 'Add User To File Successfully',
        });
      }
    }
    return res.status(HttpStatus.OK).json({
      data: {},
      status: 'false',
      message: 'Add User To File Failed',
    });
  }

  @Post('/deleteShared')
  async deleteUserFromSharedFile(@Res() res, @Body() body) {
    const result = await this.fileService.deleteUserFromSharedFile(
      body.userId,
      body.fileId
    );
    if (result) {
      return res.status(HttpStatus.OK).json({
        data: {},
        status: 'true',
        message: 'Delete User From File Successfully',
      });
    }
    return res.status(HttpStatus.OK).json({
      data: {},
      status: 'false',
      message: 'Delete User From File Failed',
    });
  }

  @Get('/getUserShared')
  async getFileUserShared(
    @Res() res,
    @Query('id') fileId,
    @Query('offset') offset
  ) {
    const objects = await this.fileService.getFileUserShared(fileId, offset);
    const result = await this.appService.getUsersByIdArr(objects.sharedTo);
    return res.status(HttpStatus.OK).json({
      data: objects.sharedTo.length > 0 ? result.data : [],
      status: 'true',
      message: 'Get User File Shared Successfully',
    });
  }

  @Get('/getFilesShared')
  async getFilesShared(
    @Res() res,
    @UserId() userId,
    @Query('offset') offset,
    @Query('sort') sort,
    @Query('status') status,
    @Query('keyword') keyword,
    @Query('order') order
  ) {
    // const userId = 'null';
    const objects = await this.fileService.getFilesSharedByUserId(
      userId,
      offset,
      keyword,
      sort,
      order
    );
    return res.status(HttpStatus.OK).json({
      data: {
        data: objects,
      },
      status: 'true',
      message: 'Get User File Shared Successfully',
    });
  }

  @Post('/createFolder')
  async createFolder(@Res() res, @Body() body) {
    const result = await this.folderService.create(body);
    if (result) {
      return res.status(HttpStatus.OK).json({
        data: {},
        status: 'true',
        message: 'Create Folder Successfully',
      });
    }
    return res.status(HttpStatus.OK).json({
      data: {},
      status: 'false',
      message: 'Create Folder Failed',
    });
  }

  @Get('/getFolders')
  async getFolders(
    @Res() res,
    @UserId() userId,
    @Query('offset') offset,
    @Query('sort') sort,
    @Query('keyword') keyword,
    @Query('order') order
  ) {
    // const userId = 'null';
    const objects = await this.folderService.getFoldersByUserId(
      userId,
      offset,
      keyword,
      sort,
      order
    );
    return res.status(HttpStatus.OK).json({
      data: {
        data: objects,
      },
      status: 'true',
      message: 'Get Folders Successfully',
    });
  }

  @Post('/deleteFolder')
  async deleteFolder(@Res() res, @Body() body) {
    const result = await this.folderService.deleteFolder(body.id);
    if (result) {
      return res.status(HttpStatus.OK).json({
        data: {},
        status: 'true',
        message: 'Delete Folder Successfully',
      });
    }
    return res.status(HttpStatus.OK).json({
      data: {},
      status: 'false',
      message: 'Delete Folder Failed',
    });
  }

  @Get('/getFilesInFolder')
  async getFilesInFolder(
    @Res() res,
    @UserId() userId,
    @Query('id') folderId,
    @Query('offset') offset
  ) {
    // const userId = 'null';
    const result = await this.folderService.getFilesIdByFolderId(
      folderId,
      offset
    );
    const objects = await this.fileService.getFilesByIdArray(
      result.files,
      userId
    );
    return res.status(HttpStatus.OK).json({
      data: { data: objects },
      status: 'true',
      message: 'Get Files In Folder Successfully',
    });
  }

  @Post('/updateFileInFolder')
  async updateFileInFolder(@Res() res, @Body() body) {
    const checkExisted = await this.folderService.checkFileInFolder(
      body.fileId,
      body.folderId
    );
    let result = {};
    if (checkExisted)
      result = await this.folderService.removeFileFromFolder(
        body.fileId,
        body.folderId
      );
    else
      result = await this.folderService.addFileToFolder(
        body.fileId,
        body.folderId
      );
    if (result)
      return res.status(HttpStatus.OK).json({
        data: {},
        status: 'true',
        message: 'Update File In Folder Successfully',
      });
    return res.status(HttpStatus.OK).json({
      data: {},
      status: 'false',
      message: 'Update File In Folder Failed',
    });
  }

  @Get('/getFolderListOfFile')
  async getFolderListOfFile(
    @Res() res,
    @UserId() userId,
    @Query('id') fileId,
    @Query('offset') offset
  ) {
    const objects = await this.folderService.getFolderListOfFile(
      fileId,
      offset,
      userId
    );
    return res.status(HttpStatus.OK).json({
      data: {
        data: objects,
      },
      status: 'true',
      message: 'Get Folder List Successfully',
    });
  }

  @Post('/markFile')
  async markFile(@Res() res, @UserId() userId, @Body() body) {
    // const userId = 'null';
    const result = await this.fileService.markFile(body.id, userId);
    if (result) {
      return res.status(HttpStatus.OK).json({
        data: {},
        status: 'true',
        message: 'Mark File Successfully',
      });
    }
    return res.status(HttpStatus.OK).json({
      data: {},
      status: 'false',
      message: 'Mark File Failed',
    });
  }

  @Post('/unmarkFile')
  async unmarkFile(@Res() res, @UserId() userId, @Body() body) {
    // const userId = 'null';
    const result = await this.fileService.unmarkFile(body.id, userId);
    if (result) {
      return res.status(HttpStatus.OK).json({
        data: {},
        status: 'true',
        message: 'Unmark File Successfully',
      });
    }
    return res.status(HttpStatus.OK).json({
      data: {},
      status: 'false',
      message: 'Unmark File Failed',
    });
  }

  @Get('/getStarredFiles')
  async getStarredFiles(
    @Res() res,
    @UserId() userId,
    @Query('offset') offset,
    @Query('sort') sort,
    @Query('keyword') keyword,
    @Query('order') order
  ) {
    // const userId = 'null';
    const objects = await this.fileService.getStarredFiles(
      userId,
      offset,
      keyword,
      sort,
      order
    );
    return res.status(HttpStatus.OK).json({
      data: {
        data: objects,
      },
      status: 'true',
      message: 'Get Starred Files Successfully',
    });
  }

  @Get('/getDeletedFiles')
  async getDeletedFiles(
    @Res() res,
    @UserId() userId,
    @Query('offset') offset,
    @Query('sort') sort,
    @Query('keyword') keyword,
    @Query('order') order
  ) {
    // const userId = 'null';
    const objects = await this.fileService.getDeletedFiles(
      userId,
      offset,
      keyword,
      sort,
      order
    );
    return res.status(HttpStatus.OK).json({
      data: {
        data: objects,
      },
      status: 'true',
      message: 'Get Deleted Files Successfully',
    });
  }

  @Post('/restoreFile')
  async restoreFile(@Res() res, @Body() body) {
    const result = await this.fileService.restoreFile(body.id);
    if (result) {
      return res.status(HttpStatus.OK).json({
        data: {},
        status: 'true',
        message: 'Restore File Successfully',
      });
    }
    return res.status(HttpStatus.OK).json({
      data: {},
      status: 'false',
      message: 'Restore File Failed',
    });
  }
}

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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { Multer } from 'multer';
import { AppService } from './app.service';
import { FileService } from './services/file.service';
import { File } from './schemas/file.schema';
import { S3Service } from './services/s3.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly fileService: FileService,
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
    @Query('user') userId,
    @Query('offset') offset,
    @Query('sort') sort,
    @Query('status') status,
    @Query('keyword') keyword,
    @Query('order') order
  ) {
    userId = null;
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
        xfdf: object.xfdf,
      },
      status: 'true',
      message: 'Get File Successfully',
    });
  }

  @Post('/editFile')
  async editFile(@Res() res, @Body() body) {
    const result = await this.fileService.updateXfdfById(body.id, body.xfdf);
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
    //body.email => Email to be Shared
    //Find ObjectId of that Email User
    //body.id => FileId
    const id = '644783c0af1a55de6da19347';
    const result = await this.fileService.addUserToSharedFile(id, body.id);
    if (result) {
      return res.status(HttpStatus.OK).json({
        data: {},
        status: 'true',
        message: 'Add User To File Successfully',
      });
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
    //objects.sharedTo references to UserId (Send Id => Get Email and Username)
    return res.status(HttpStatus.OK).json({
      data: objects,
      status: 'true',
      message: 'Get User File Shared Successfully',
    });
  }

  @Get('/getFileShared')
  async getFileShared(@Res() res, @Query('id') userId) {
    const objects = await this.fileService.getFileSharedByUserId(userId);
    return res.status(HttpStatus.OK).json({
      data: objects,
      status: 'true',
      message: 'Get User File Shared Successfully',
    });
  }
}

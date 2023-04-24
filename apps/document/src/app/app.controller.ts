import {
  Controller,
  Get,
  Post,
  Res,
  Body,
  HttpStatus,
  Req,
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
    @Body() pdfInfo: File
  ) {
    const object = await this.fileService.create(pdfInfo);
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
    // const result = await this.s3Service.delete(pdfInfo.name + '.pdf');
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
    @Query('keyword') keyword
  ) {
    const objects = await this.fileService.getOwnFilesByUserId(userId, offset);
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
}

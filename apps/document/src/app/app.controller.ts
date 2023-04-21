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

  @Post('/upload')
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
      await this.fileService.updateById(object._id, result.Location);
      return res.status(HttpStatus.CREATED).json({
        data: {},
        status: 'true',
        message: 'Upload File Successfully',
      });
    }
    return res.status(HttpStatus.CREATED).json({
      data: {},
      status: 'false',
      message: 'Upload File Failed',
    });
  }

  @Post('/delete')
  async deleteFile(@Res() res, @Body() body) {
    // const result = await this.s3Service.delete(pdfInfo.name + '.pdf');
  }

  @Get('/get')
  async getOwnFiles(@Res() res, @Query('user') userId) {
    const objects = await this.fileService.getOwnFilesByUserId(userId);
    return res.status(HttpStatus.CREATED).json({
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
    return res.status(HttpStatus.CREATED).json({
      data: {
        xfdf: object.xfdf,
      },
      status: 'true',
      message: 'Get File Successfully',
    });
  }
}

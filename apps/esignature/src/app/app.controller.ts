import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppService } from './app.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('create_self_ca')
  async createSelfCA(data: any) {
    console.log('createSelfCA');
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
    const { issued, password, fileName, expireAfter } = data;
    return this.appService.createSelfCA(
      issued,
      password,
      fileName,
      expireAfter
    );
    // .subscribe((result) => {
    //   console.log('first', result);
    //   process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1';
    //   return {
    //     data: result.data,
    //     message: 'Created',
    //   };
    // });
  }

  @Get()
  getData() {
    return this.appService.getData();
  }

  @Post('/test')
  test(@Res() res) {
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
    this.appService.test().subscribe((result) => {
      process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1';
      return res.status(HttpStatus.OK).json({
        data: result.data,
        message: 'Connected',
      });
    });
  }

  @MessagePattern('sign_document')
  async signDocument(data: any) {
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
    const result = await this.appService.signPDF(data);
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1';
    return {
      data: result,
      status: 'true',
      message: 'Signed PDF',
    };
  }
}

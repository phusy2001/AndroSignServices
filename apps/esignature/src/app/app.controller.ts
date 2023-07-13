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
  async createSelfCA(@Payload() data: any) {
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
    const {
      issued,
      password,
      fileName,
      expireAfter = 0,
      isUpdate = false,
      newPass = '',
    } = data;
    const result = await this.appService.createSelfCA(
      issued,
      password,
      fileName,
      expireAfter,
      isUpdate,
      newPass
    );

    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1';
    return {
      data: result.data,
      message: 'Created',
    };
  }

  @MessagePattern('encrypt_password_ca')
  async encrypt(@Payload() plainText: string) {
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
    const result = await this.appService.encrypt(plainText);

    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1';
    return {
      data: result,
      status: 'true',
      message: 'Encrypt password successfully',
    };
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
    if (result.data.status)
      return {
        data: result.data.data,
        status: 'true',
        message: 'Signed PDF Successfully',
      };
    return {
      data: {},
      status: 'false',
      message: 'Signed PDF Failed',
    };
  }

  @MessagePattern('convert_file')
  async convertFile(fullName: string) {
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
    const result = await this.appService.convertFile(fullName);
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1';
    if (result.data.status)
      return {
        data: result.data.data,
        status: 'true',
        message: 'Converted',
      };
    return {
      data: {},
      status: 'false',
      message: 'Signed PDF Failed',
    };
  }
}

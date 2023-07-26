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
      expireAfter = 30,
      isUpdate = false,
      newPass = 'null',
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

  @MessagePattern('sign_document_img')
  async signDocumentWithImg(data: any) {
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
    const result = await this.appService.signPDF(data, 'img');
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1';
    if (result.data.status)
      return {
        data: result.data.data,
        status: 'true',
        message: 'Signed PDF Successfully',
      };
    return {
      data: result.data,
      status: 'false',
      message: 'Signed PDF Failed',
    };
  }

  @MessagePattern('sign_document_ca')
  async signDocumentWithCA(data: any) {
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
    const result = await this.appService.signPDF(data, 'ca');
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1';
    if (result.data.status)
      return {
        data: result.data.data,
        status: 'true',
        message: 'Signed PDF Successfully',
      };
    return {
      data: result.data,
      status: 'false',
      message: 'Signed PDF Failed',
    };
  }

  @MessagePattern('toPdf')
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

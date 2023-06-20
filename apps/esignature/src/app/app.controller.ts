import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

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

  @Post('/createSelfCA')
  createSelfCA(
    @Res() res,
    @Query('issued') issued: string,
    @Query('password') password: string,
    @Query('fileName') fileName: string,
    @Query('expireAfter') expireAfter?: number
  ) {
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
    this.appService
      .createSelfCA(issued, password, fileName, expireAfter)
      .subscribe((result) => {
        process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1';
        return res.status(HttpStatus.OK).json({
          data: result.data,
          message: 'Created',
        });
      });
  }

  @Post('/signPDF')
  @UseInterceptors(FileInterceptor('file'))
  signPDF(@Res() res, @Body() data) {
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
    this.appService.signPDF(data).subscribe((result) => {
      process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1';
      return res.status(HttpStatus.OK).json({
        data: result.data,
        message: 'Signed PDF',
      });
    });
  }
}

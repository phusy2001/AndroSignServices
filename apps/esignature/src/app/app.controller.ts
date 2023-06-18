import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';

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
  signPDF(
    @Res() res,
    @Query('pdfPath') pdfPath: string,
    @Query('pfxPath') pfxPath: string,
    @Query('password') password: string,
    @Query('imgPath') imgPath: string,
    @Query('stepNo') stepNo: string,
    @Query('xfdf') xfdf: string
  ) {
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
    this.appService
      .signPDF(pdfPath, pfxPath, password, imgPath, stepNo, xfdf)
      .subscribe((result) => {
        return res.status(HttpStatus.OK).json({
          data: result.data,
          message: 'Signed PDF',
        });
      });
  }
}

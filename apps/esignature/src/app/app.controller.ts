import { Controller, Get, HttpStatus, Param, Post, Res } from '@nestjs/common';

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
    return res.status(HttpStatus.OK).json({
      data: this.appService.test(),
      message: 'Connected',
    });
  }

  @Post('/createSelfCA')
  createSelfCA(
    @Res() res,
    @Param('issued') issued,
    @Param('password') password,
    @Param('fileName') fileName,
    @Param('expireAfter') expireAfter?: number
  ) {
    return res.status(HttpStatus.OK).json({
      data: this.appService.createSelfCA(
        issued,
        password,
        fileName,
        expireAfter
      ),
      message: 'Created',
    });
  }
}

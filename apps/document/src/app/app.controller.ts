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
import { UserId, AuthGuard } from '@androsign-microservices/shared';
import { MessagePattern } from '@nestjs/microservices';

@UseGuards(AuthGuard)
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
    // const count = await this.fileService.findNameByUser(body.user, body.name);
    // const now = new Date();
    // if (count > 0) body.name += `-${now.getTime()}`;
    const object = await this.fileService.create(body);
    const result = await this.s3Service.upload(
      pdfFile.buffer,
      body.user + '/' + object._id + '.pdf'
    );
    if (result) {
      this.fileService.updatePathById(object._id, result.Location);
      this.fileService.updateFileHistory(object._id, body.user, 'create');
      this.appService.getUserFcmtoken(body.stepUser).then((data: any) => {
        if (data.data.fcm_tokens)
          this.appService.sendUserNotification(
            data.data.fcm_tokens,
            'Thông báo',
            `Tài liệu  ${body.name} đang chờ bạn ký`
          );
      });
      const owner = await this.appService.getUsersByIdArr([object.user]);
      this.appService.getUsersByIdArr(object.sharedTo).then((data: any) => {
        if (data.data.length > 0) {
          for (const item of data.data) {
            this.appService.sendEmailNotification(
              item.email,
              `AndroSign mời bạn ký tài liệu ${object.name}`,
              `Bạn được mời bởi <a href="mailto:${owner.data[0].email}">${owner.data[0].email}</a> để tham gia vào ký kết văn bản <b>${object.name}</b>.`,
              `Lời mời tham gia ký kết tài liệu`
            );
          }
        }
      });
      return res.status(HttpStatus.OK).json({
        data: {},
        status: 'true',
        message: 'Tài liệu được tải lên thành công',
      });
    }
    return res.status(HttpStatus.OK).json({
      data: {},
      status: 'false',
      message: 'Tài liệu tải lên thất bại',
    });
  }

  @Post('/deleteFile')
  async deleteFile(@Res() res, @UserId() userId, @Body() body) {
    const result = await this.fileService.deleteFile(body.id);
    this.fileService.updateFileHistory(body.id, userId, 'delete');
    if (result) {
      return res.status(HttpStatus.OK).json({
        data: {},
        status: 'true',
        message: 'Tài liệu đã được chuyển vào thùng rác',
      });
    }
    return res.status(HttpStatus.OK).json({
      data: {},
      status: 'false',
      message: 'Xóa tài liệu thất bại',
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
    const objects = await this.fileService.getOwnFilesByUserId(
      userId,
      offset,
      keyword,
      sort,
      order,
      status
    );
    return res.status(HttpStatus.OK).json({
      data: {
        data: objects,
      },
      status: 'true',
      message: 'Lấy thông tin tài liệu của tôi thành công',
    });
  }

  @Get('/getXfdf')
  async getFileXfdf(@Res() res, @UserId() userId, @Query('id') id) {
    const object = await this.fileService.getFileXfdf(id);
    this.fileService.updateFileHistory(id, userId, 'open');
    return res.status(HttpStatus.OK).json({
      data: {
        data: object,
      },
      status: 'true',
      message: 'Lấy thông tin tài liệu thành công',
    });
  }

  @Post('/editFile')
  async editFile(@Res() res, @UserId() userId, @Body() body) {
    // const password = await this.appService.encryptPassword(body.passCa);
    const owner = await this.fileService.getOwnerById(body.id);
    const result = await this.appService.signDocument({
      PdfPath: owner.user + '/' + body.id + '.pdf',
      PfxPath: userId + '.pfx',
      PassWord: body.passCa,
      Xfdf: body.xfdf,
      StepNo: `${body.stepOld}`,
    });
    if (result.status === 'true') {
      const object = await this.fileService.updateFileById(
        body.id,
        body.signed,
        body.step,
        body.user
      );
      if (object) {
        this.fileService.updateFileHistory(body.id, userId, 'save');
        if (object.stepIndex + 1 === object.stepTotal) {
          this.appService.getUserFcmtoken(object.user).then((data: any) => {
            if (data.data.fcm_tokens)
              this.appService.sendUserNotification(
                data.data.fcm_tokens,
                'Thông báo',
                `Tài liệu ${object.name} đã hoàn tất`
              );
          });
          this.appService.getUsersByIdArr([object.user]).then((data: any) => {
            this.appService.sendEmailNotification(
              data.data[0].email,
              `AndroSign tài liệu ${object.name} đã hoàn thành`,
              `Tài liệu <b>${object.name}</b> đã hoàn thành quy trình ký kết.
              <p><a href="${object.path}">Bấm vào đây để tải xuống tài liệu</a></p>`,
              `Thông báo tài liệu hoàn thành`
            );
          });
          this.appService.getUsersByIdArr(object.sharedTo).then((data: any) => {
            if (data.data.length > 0) {
              for (const item of data.data) {
                if (item !== undefined && item !== null)
                  this.appService.sendEmailNotification(
                    item.email,
                    `AndroSign tài liệu ${object.name} đã hoàn thành`,
                    `Tài liệu <b>${object.name}</b> đã hoàn thành quy trình ký kết.
                    <p><a href="${object.path}">Bấm vào đây để tải xuống tài liệu</a></p>`,
                    `Thông báo tài liệu hoàn thành`
                  );
              }
            }
          });
        } else {
          this.appService.getUserFcmtoken(body.user).then((data: any) => {
            if (data.data.fcm_tokens)
              this.appService.sendUserNotification(
                data.data.fcm_tokens,
                'Thông báo',
                `Tài liệu ${object.name} đang chờ bạn ký`
              );
          });
          this.appService.getUsersByIdArr([body.user]).then((data: any) => {
            if (data.data.length > 0)
              if (data.data[0] !== undefined && data.data[0] !== null)
                this.appService.sendEmailNotification(
                  data.data[0].email,
                  `AndroSign nhắc nhở ký kết tài liệu ${object.name}`,
                  `Tài liệu <b>${object.name}</b> hiện đang chờ bạn để xác nhận ký. Vui lòng truy cập vào ứng dụng để thực hiện việc ký kết văn bản.`,
                  `Thông báo nhắc nhở ký kết văn bản`
                );
          });
        }
        return res.status(HttpStatus.OK).json({
          data: {},
          status: 'true',
          message: 'Tài liệu đã ký thành công',
        });
      }
    }
    return res.status(HttpStatus.OK).json({
      data: {},
      status: 'false',
      message: result.data.error,
    });
  }

  @Post('/addShared')
  async addUserToSharedFile(@Res() res, @UserId() userId, @Body() body) {
    const object = await this.appService.getIdByUserEmail(body.email);
    if (object.status === 'true') {
      const uid = object.data.uid;
      if (uid === userId)
        return res.status(HttpStatus.OK).json({
          data: {},
          status: 'false',
          message: 'Người dùng chia sẻ phải là người dùng khác bản thân',
        });
      const result = await this.fileService.addUserToSharedFile(uid, body.id);
      if (result) {
        this.appService.getUserFcmtoken(uid).then((data: any) => {
          if (data.data.fcm_tokens)
            this.appService.sendUserNotification(
              data.data.fcm_tokens,
              'Thông báo',
              `Tài liệu ${result.name} đã được chia sẻ với bạn`
            );
        });
        this.fileService.getOwnerById(body.id).then((data: any) => {
          this.appService.getUsersByIdArr([data.user]).then((owner: any) => {
            this.appService.sendEmailNotification(
              body.email,
              `AndroSign tài liệu ${data.name} được chia sẻ với bạn`,
              `Bạn được chia sẻ tài liệu văn bản <b>${data.name}</b> bởi người dùng <a href="mailto:${owner.data[0].email}">${owner.data[0].email}</a>.`,
              `Tài liệu chia sẻ mới`
            );
          });
        });
        return res.status(HttpStatus.OK).json({
          data: {},
          status: 'true',
          message: 'Chia sẻ tài liệu cho người dùng thành công',
        });
      }
    } else {
      this.appService.sendEmailNotification(
        body.email,
        'AndroSign mời bạn sử dụng dịch vụ',
        `Bạn đã được người dùng của AndroSign mời tham gia thực hiện ký kết văn bản. Có vẻ như bạn vẫn chưa có tài khoản trên hệ thống, chúng tôi hi vọng bạn sẽ đăng ký và sử dụng dịch vụ của chúng tôi.
        <p><a href="https://temp-mail.org/vi/view/64d25a8654883312c4c3cb33">Bấm vào đây để tải xuống ứng dụng.</a></p>`,
        'Lời mời tham gia ứng dụng'
      );
      return res.status(HttpStatus.OK).json({
        data: {},
        status: 'false',
        message: 'Email người dùng không tồn tại trên hệ thống',
      });
    }
    return res.status(HttpStatus.OK).json({
      data: {},
      status: 'false',
      message: 'Chia sẻ tài liệu thất bại',
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
        message: 'Xóa người dùng được chia sẻ thành công',
      });
    }
    return res.status(HttpStatus.OK).json({
      data: {},
      status: 'false',
      message: 'Xóa người dùng được chia sẻ thất bại',
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
    const data = result.data.filter(
      (item: any) => item !== undefined && item !== null
    );
    return res.status(HttpStatus.OK).json({
      data: objects.sharedTo.length > 0 ? data : [],
      status: 'true',
      message: 'Lấy thông tin người dùng chia sẻ của tài liệu thành công',
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
    const objects = await this.fileService.getFilesSharedByUserId(
      userId,
      offset,
      keyword,
      sort,
      order,
      status
    );
    return res.status(HttpStatus.OK).json({
      data: {
        data: objects,
      },
      status: 'true',
      message: 'Lấy thông tin tài liệu được chia sẻ thành công',
    });
  }

  @Post('/createFolder')
  async createFolder(@Res() res, @Body() body) {
    // const count = await this.folderService.findNameByUser(body.user, body.name);
    // const now = new Date();
    // if (count > 0) body.name += `-${now.getTime()}`;
    const result = await this.folderService.create(body);
    if (result) {
      return res.status(HttpStatus.OK).json({
        data: {},
        status: 'true',
        message: 'Thư mục mới đã được tạo thành công',
      });
    }
    return res.status(HttpStatus.OK).json({
      data: {},
      status: 'false',
      message: 'Tạo thư mục mới thất bại',
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
      message: 'Lấy danh sách thư mục thành công',
    });
  }

  @Post('/deleteFolder')
  async deleteFolder(@Res() res, @Body() body) {
    const result = await this.folderService.deleteFolder(body.id);
    if (result) {
      return res.status(HttpStatus.OK).json({
        data: {},
        status: 'true',
        message: 'Thư mục đã xóa thành công',
      });
    }
    return res.status(HttpStatus.OK).json({
      data: {},
      status: 'false',
      message: 'Xóa thư mục thất bại',
    });
  }

  @Get('/getFilesInFolder')
  async getFilesInFolder(
    @Res() res,
    @UserId() userId,
    @Query('id') folderId,
    @Query('offset') offset,
    @Query('keyword') keyword
  ) {
    if (keyword === '') {
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
        message: 'Lấy danh sách tài liệu trong thư mục thành công',
      });
    } else {
      const result = await this.folderService.getAllFileIdsInFolder(folderId);
      const objects = await this.fileService.searchFilesInIdArray(
        result.files,
        userId,
        keyword,
        offset
      );
      return res.status(HttpStatus.OK).json({
        data: { data: objects },
        status: 'true',
        message: 'Lấy danh sách tài liệu trong thư mục thành công',
      });
    }
  }

  @Post('/updateFileInFolder')
  async updateFileInFolder(@Res() res, @Body() body) {
    const checkExisted = await this.folderService.checkFileInFolder(
      body.fileId,
      body.folderId
    );
    if (checkExisted) {
      const result = await this.folderService.removeFileFromFolder(
        body.fileId,
        body.folderId
      );
      if (result)
        return res.status(HttpStatus.OK).json({
          data: {},
          status: 'true',
          message: 'Tài liệu đã được xóa khỏi thư mục',
        });
    } else {
      const result = await this.folderService.addFileToFolder(
        body.fileId,
        body.folderId
      );
      if (result)
        return res.status(HttpStatus.OK).json({
          data: {},
          status: 'true',
          message: 'Tài liệu đã được thêm vào thư mục',
        });
    }
    return res.status(HttpStatus.OK).json({
      data: {},
      status: 'false',
      message: 'Cập nhật tài liệu trong thư mục thất bại',
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
      message: 'Lấy danh sách thư mục thành công',
    });
  }

  @Post('/markFile')
  async markFile(@Res() res, @UserId() userId, @Body() body) {
    const result = await this.fileService.markFile(body.id, userId);
    if (result) {
      return res.status(HttpStatus.OK).json({
        data: {},
        status: 'true',
        message: 'Đã gắn sao cho tài liệu',
      });
    }
    return res.status(HttpStatus.OK).json({
      data: {},
      status: 'false',
      message: 'Gắn sao cho tài liệu thất bại',
    });
  }

  @Post('/unmarkFile')
  async unmarkFile(@Res() res, @UserId() userId, @Body() body) {
    const result = await this.fileService.unmarkFile(body.id, userId);
    if (result) {
      return res.status(HttpStatus.OK).json({
        data: {},
        status: 'true',
        message: 'Tài liệu đã được gỡ sao',
      });
    }
    return res.status(HttpStatus.OK).json({
      data: {},
      status: 'false',
      message: 'Gỡ sao cho tài liệu thất bại',
    });
  }

  @Get('/getStarredFiles')
  async getStarredFiles(
    @Res() res,
    @UserId() userId,
    @Query('offset') offset,
    @Query('sort') sort,
    @Query('status') status,
    @Query('keyword') keyword,
    @Query('order') order
  ) {
    const objects = await this.fileService.getStarredFiles(
      userId,
      offset,
      keyword,
      sort,
      order,
      status
    );
    return res.status(HttpStatus.OK).json({
      data: {
        data: objects,
      },
      status: 'true',
      message: 'Lấy danh sách tài liệu gắn sao thành công',
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
      message: 'Lấy danh sách tài liệu bị xóa thành công',
    });
  }

  @Post('/restoreFile')
  async restoreFile(@Res() res, @UserId() userId, @Body() body) {
    const result = await this.fileService.restoreFile(body.id);
    this.fileService.updateFileHistory(body.id, userId, 'restore');
    if (result) {
      return res.status(HttpStatus.OK).json({
        data: {},
        status: 'true',
        message: 'Phục hồi tài liệu thành công',
      });
    }
    return res.status(HttpStatus.OK).json({
      data: {},
      status: 'false',
      message: 'Phục hồi tài liệu thất bại',
    });
  }

  @Post('/deletePermanently')
  async deletePermanently(@Res() res, @UserId() userId, @Body() body) {
    const result = await this.fileService.deletePermanently(body.id);
    if (result) {
      this.s3Service.delete(userId + '/' + body.id + '.pdf');
      return res.status(HttpStatus.OK).json({
        data: {},
        status: 'true',
        message: 'Tài liệu đã được xóa khỏi hệ thống',
      });
    }
    return res.status(HttpStatus.OK).json({
      data: {},
      status: 'false',
      message: 'Xóa vĩnh viễn tài liệu thất bại',
    });
  }

  @Get('/getFileHistory')
  async getFileHistory(
    @Res() res,
    @Query('id') fileId,
    @Query('offset') offset
  ) {
    const object: any = await this.fileService.getFileHistory(fileId, offset);
    for (const item of object.history) {
      const data = await this.appService.getUsersByIdArr([item.user]);
      if (data.data[0]) item.text = data.data[0].display_name;
      else item.text = '[Tài khoản đã bị xóa]';
      if (item.action === 'open') item.text += ' đã mở tài liệu';
      else if (item.action === 'create') item.text += ' đã tạo tài liệu';
      else if (item.action === 'save') item.text += ' đã xác nhận ký tài liệu';
      else if (item.action === 'delete') item.text += ' đã xóa tài liệu';
      else if (item.action === 'restore') item.text += ' đã phục hồi tài liệu';
    }
    return res.status(HttpStatus.OK).json({
      data: {
        data: object.history,
      },
      status: 'true',
      message: 'Lấy lịch sử thay đổi tài liệu thành công',
    });
  }

  @Post('/renameFile')
  async renameFile(@Res() res, @UserId() userId, @Body() body) {
    // const count = await this.fileService.findNameByUser(userId, body.name);
    // const now = new Date();
    // if (count > 0) body.name += `-${now.getTime()}`;
    const result = await this.fileService.renameFile(body.id, body.name);
    if (result) {
      return res.status(HttpStatus.OK).json({
        data: {
          name: body.name,
        },
        status: 'true',
        message: 'Đổi tên tài liệu thành công',
      });
    }
    return res.status(HttpStatus.OK).json({
      data: {},
      status: 'false',
      message: 'Đổi tên tài liệu thất bại',
    });
  }

  @Post('/renameFolder')
  async renameFolder(@Res() res, @UserId() userId, @Body() body) {
    // const count = await this.folderService.findNameByUser(userId, body.name);
    // const now = new Date();
    // if (count > 0) body.name += `-${now.getTime()}`;
    const result = await this.folderService.renameFolder(body.id, body.name);
    if (result) {
      return res.status(HttpStatus.OK).json({
        data: {
          name: body.name,
        },
        status: 'true',
        message: 'Đổi tên thư mục thành công',
      });
    }
    return res.status(HttpStatus.OK).json({
      data: {},
      status: 'false',
      message: 'Đổi tên thư mục thất bại',
    });
  }

  @Get('/admin/getOverviewDocuments')
  async getOverviewDocuments(@Res() res) {
    const result = await this.fileService.getTotalCount(false);
    const result1 = await this.fileService.getRecentCount(7, false);

    return res.status(HttpStatus.OK).json({
      data: {
        total: result,
        totalRecent: result1,
      },
      status: 'true',
      message: 'Lấy số lượng tài liệu thành công',
    });
  }

  @Get('/admin/getOverviewCDocuments')
  async getOverviewCDocuments(@Res() res) {
    const result = await this.fileService.getTotalCount(true);
    const result1 = await this.fileService.getRecentCount(1, true);

    return res.status(HttpStatus.OK).json({
      data: {
        total: result,
        totalRecent: result1,
      },
      status: 'true',
      message: 'Lấy số lượng tài liệu hoàn thành thành công',
    });
  }

  @Get('/admin/getOverviewStorage')
  async getOverviewStorage(@Res() res) {
    const result = await this.s3Service.getFolderCapacity(
      'androsign',
      'documents'
    );
    const usage = result / 1048576;
    return res.status(HttpStatus.OK).json({
      data: {
        documentUsage: usage.toFixed(2) + ' MB',
      },
      status: 'true',
      message: 'Lấy dung lượng bộ nhớ thành công',
    });
  }

  @Get('/admin/getDocumentStatistics')
  async getDocumentStatistics(@Res() res) {
    const result = await this.fileService.getTotalCount(true);
    const result1 = await this.fileService.getTotalWaitingDocs();
    return res.status(HttpStatus.OK).json({
      data: {
        completed: result,
        waiting: result1,
      },
      status: 'true',
      message: 'Lấy thống kê người dùng thành công',
    });
  }
}

@Controller()
export class DocController {
  constructor(
    private readonly fileService: FileService,
    private readonly folderService: FolderService,
    private readonly appSerivce: AppService,
    private readonly s3Service: S3Service
  ) {}

  @MessagePattern('get_user_usage')
  async getUserDocCount(userId: string) {
    const files = await this.fileService.getTotalCount(false, userId);
    const folders = await this.folderService.getTotalFolders(userId);
    return {
      data: { files, folders },
      status: 'true',
      message: 'Lấy số lượng tài liệu thư mục thành công',
    };
  }

  @MessagePattern('delete_data')
  async deleteUserData(userId: string) {
    try {
      await this.fileService.deleteDataOfUser(userId);
      await this.folderService.deleteDataOfUser(userId);
      await this.s3Service.deleteFolder(userId);
      return {
        data: {},
        status: 'true',
        message: 'Xóa dữ liệu người dùng thành công',
      };
    } catch (error) {
      return {
        data: {},
        status: 'false',
        message: 'Xóa dữ liệu người dùng thất bại',
      };
    }
  }
}

import { MessagePattern } from '@nestjs/microservices';
import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Delete,
  Param,
  Put,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { AuthGuard } from '@androsign-microservices/shared';
import { UserId, firebase } from '@androsign-microservices/shared';
import { auth } from 'firebase-admin';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() dto: CreateUserDto) {
    const result = await this.find(dto.uid);
    if (result.status === 'false') {
      const user = await this.usersService.create(dto);
      return {
        data: user,
        status: 'true',
        message: 'Tạo người dùng thành công',
      };
    }
    return {
      data: {},
      status: 'false',
      message: 'Tạo người dùng thất bại',
    };
  }

  @Get()
  @UseGuards(AuthGuard)
  async findAll() {
    const users = await this.usersService.findAll();
    if (users) {
      return {
        data: users,
        status: 'true',
        message: 'Lấy toàn bộ người dùng thành công',
      };
    }
    return {
      data: {},
      status: 'false',
      message: 'Lấy toàn bộ người dùng thất bại',
    };
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async find(@Param('id') uid: string) {
    const user = await this.usersService.find(uid);
    if (user) {
      return {
        data: user,
        status: 'true',
        message: `Lấy người dùng với id ${uid} thành công`,
      };
    }
    return {
      data: {},
      status: 'false',
      message: `Lấy người dùng với id ${uid} thất bại`,
    };
  }

  @Get(':id/get-created-date')
  async getCreatedDate(@Param('id') uid: string) {
    const user = await this.usersService.getCreatedDate(uid);
    if (user) {
      return {
        data: user,
        status: 'true',
        message: `Lấy ngày tạo với id ${uid} thành công`,
      };
    }
    return {
      data: {},
      status: 'false',
      message: `Lấy ngày tạo với id ${uid} thất bại`,
    };
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async update(@Param('id') uid: string, @Body() dto: UpdateUserDto) {
    const user = await this.usersService.find(uid);
    if (!user) {
      return {
        data: {},
        status: 'false',
        message: `Không tìm thấy người dùng với id ${uid} `,
      };
    }
    const result = await this.usersService.update(uid, dto);
    if (result) {
      return {
        data: result,
        status: 'true',
        message: `Cập nhật người dùng thành công`,
      };
    }
    return {
      data: {},
      status: 'false',
      message: `Cập nhật người dùng với id ${uid} thất bại`,
    };
  }

  @Delete(':id')
  async delete(@Param('id') uid: string) {
    try {
      console.log('uid', uid);
      await firebase.auth().deleteUser(uid);
      await this.usersService.delete(uid);
      this.usersService.deleteUserData(uid);
      return {
        data: {},
        message: 'Xóa người dùng thành công',
        status: 'true',
      };
    } catch (error) {
      console.log(error);
      return {
        data: {},
        message: 'Xóa người dùng thất bại',
        status: 'false',
      };
    }
  }

  @Get(':id/change-status')
  @UseGuards(AuthGuard)
  async changeStatus(@Param('id') uid: string) {
    const user = await this.usersService.find(uid);
    if (!user) {
      return {
        data: {},
        status: 'false',
        message: `Không tìm thấy người dùng với id ${uid}`,
      };
    }
    const updatedUser = await this.usersService.changeStatus(uid);
    if (updatedUser.disabled) {
      const domainUser = await this.usersService.update(uid, {
        disabled: true,
      });
      await auth().revokeRefreshTokens(uid);
      return {
        data: {},
        status: 'true',
        message: `Người dùng với ${domainUser.display_name} đã vô hiệu hoá`,
      };
    } else {
      const domainUser = await this.usersService.update(uid, {
        disabled: false,
      });
      return {
        data: {},
        status: 'true',
        message: `Người dùng với ${domainUser.display_name} đã mở lại`,
      };
    }
  }

  @Post('/remove-fcm-token')
  async removeFcmToken(@Body() dto) {
    const user = await this.usersService.removeFcmToken(dto.uid, dto.fcmToken);
    if (user) {
      return {
        data: user,
        status: 'true',
        message: 'Xoá fcm token thành công',
      };
    }
    return {
      data: {},
      status: 'false',
      message: 'Xoá fcm token thất bại.',
    };
  }

  @UseGuards(AuthGuard)
  @Get('email/:email')
  async getUserByEmail(@Param('email') email: string, @UserId() userId) {
    const user = await this.usersService.findByEmail(email);
    if (user) {
      if (user.uid !== userId)
        return {
          data: user,
          status: 'true',
          message: 'Người dùng được thêm vào tài liệu thành công',
        };
      return {
        data: {},
        status: 'false',
        message: 'Không thể thêm bản thân người dùng',
      };
    }
    this.usersService.sendEmailNotification(
      email,
      'AndroSign mời bạn sử dụng dịch vụ',
      `Bạn đã được người dùng của AndroSign mời tham gia thực hiện ký kết văn bản. Có vẻ như bạn vẫn chưa có tài khoản trên hệ thống, chúng tôi hi vọng bạn sẽ đăng ký và sử dụng dịch vụ của chúng tôi.
      <p><a href="https://temp-mail.org/vi/view/64d25a8654883312c4c3cb33">Bấm vào đây để tải xuống ứng dụng.</a></p>`,
      'Lời mời tham gia ứng dụng'
    );
    return {
      data: {},
      status: 'false',
      message: 'Rất tiếc, không tìm thấy thông tin người dùng',
    };
  }

  @Put('/:id/createUserCa')
  async createUserCa(@Param('id') uid: string, @Body() dto) {
    try {
      const { email, passwordCa, expireAfter } = dto;
      const user = await this.usersService.createUserCa(
        email,
        uid,
        passwordCa,
        30
      );
      if (user) {
        return {
          data: user,
          status: 'true',
          message: 'Create User Ca successfully',
        };
      }
      return {
        data: {},
        status: 'false',
        message: 'Create User Ca failed',
      };
    } catch (error) {
      console.log('error in user control', error);
    }
  }

  @Put('/:id/updateUserCa')
  async updateUserCa(@Param('id') uid: string, @Body() dto) {
    try {
      const { email, nPasswordCa, oPasswordCa } = dto;
      const result = await this.usersService.updateUserCa(
        email,
        uid,
        nPasswordCa,
        oPasswordCa
      );
      return {
        data: {},
        status: result.data.status ? 'true' : 'false',
        message: result.data.status
          ? 'Thay đổi mật khẩu bảo vệ thành công'
          : 'Thay đổi mật khẩu bảo vệ thất bại',
      };
    } catch (error) {
      console.log(error);
    }
  }

  @Get('/:email/getAdminInfo')
  async getAdminInfo(@Param('email') email) {
    try {
      const result = await this.usersService.getAdminInfo(email);
      if (result)
        return {
          data: result,
          status: 'true',
          message: 'Lấy thông tin Admin thành công',
        };
      return {
        data: {},
        status: 'false',
        message: 'Lấy thông tin Admin thất bại',
      };
    } catch (error) {
      console.log(error);
    }
  }

  @UseGuards(AuthGuard)
  @Get('/admin/getOverviewUsers')
  async getOverviewUsers() {
    try {
      const result = await this.usersService.getTotalCount();
      const result1 = await this.usersService.getRecentUsersCount(7);
      return {
        data: {
          total: result,
          totalRecent: result1,
        },
        status: 'true',
        message: 'Lấy số lượng người dùng thành công',
      };
    } catch (error) {
      console.log(error);
    }
  }

  @UseGuards(AuthGuard)
  @Get('/admin/getUserStatistics')
  async getUserStatistics() {
    try {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const data = await this.usersService.getUsersCountInYear(currentYear);
      const arr = [...Array(12)].fill(0);
      data.map((item) => (arr[item._id.month - 1] = item.count));
      return {
        data: {
          year: currentYear,
          data: arr,
        },
        status: 'true',
        message: 'Lấy thống kê người dùng thành công',
      };
    } catch (error) {
      console.log(error);
    }
  }

  @UseGuards(AuthGuard)
  @Get('/admin/customers')
  async getCustomers(
    @Query('page') page: number,
    @Query('limit') limit: number
  ) {
    try {
      page = page ? +page : 1;
      limit = limit ? +limit : 10;
      const data = await this.usersService.getCustomers(page, limit);
      return {
        data: data,
        status: 'true',
        message: 'Lấy danh sách người dùng thành công',
      };
    } catch (error) {
      console.log(error);
    }
  }

  @UseGuards(AuthGuard)
  @Post('/admin/users')
  async createUserByAdmin(@Body() dto: any) {
    try {
      const data = await this.usersService.createUserByAdmin(dto);
      return {
        data: data,
        status: true,
        message: 'Tạo người dùng thành công',
      };
    } catch (error) {
      return {
        data: {},
        status: false,
        message: 'Tạo người dùng thất bại',
      };
    }
  }

  @UseGuards(AuthGuard)
  @Get('/admin/customers/count')
  async getCustomersQuantity() {
    try {
      const data = await this.usersService.getCustomersQty();
      return {
        data: data,
        status: 'true',
        message: 'Lấy số lượng người dùng thành công',
      };
    } catch (error) {
      console.log(error);
    }
  }

  @UseGuards(AuthGuard)
  @Get('/admin/customers/search')
  async searchCustomers(
    @Query('role') role: string,
    @Query('keyword') keyword: string
  ) {
    try {
      const data = await this.usersService.searchCustomers(role, keyword);
      return {
        data: data,
        status: 'true',
        message: 'Tìm kiếm danh sách người dùng thành công',
      };
    } catch (error) {
      console.log(error);
    }
  }

  @MessagePattern('get_users_from_list_uid')
  async findByListUid(uidList: [string]) {
    const result = await this.usersService.findByListUid(uidList);
    if (result.length > 0)
      return {
        data: result,
        status: 'true',
        message: 'Lấy danh sách người dùng từ danh sách uid thành công',
      };
    return {
      data: {},
      status: 'false',
      message: 'Lấy danh sách người dùng từ danh sách uid thất bại',
    };
  }

  @MessagePattern('get_user_by_email')
  async findByEmail(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (user)
      return {
        data: user,
        status: 'true',
        message: 'Lấy người dùng bằng email thành công.',
      };
    return {
      data: {},
      status: 'false',
      message: 'Lấy người dùng bằng email thất bại',
    };
  }

  @MessagePattern('get_fcmtoken_user')
  async getUserFcmtoken(uid: string) {
    const result = await this.usersService.getFcmToken(uid);
    if (result)
      return {
        data: result,
        status: 'true',
        message: 'Get Fcmtoken Successfully',
      };
    return {
      data: {},
      status: 'false',
      message: 'Get Fcmtoken Failed',
    };
  }

  @MessagePattern('get_uids_by_keyword')
  async getUidsByKeyword(keyword: string) {
    const result = await this.usersService.getUidsByKeyword(keyword);
    const data = Object.values(result).map((value) => {
      return value.uid;
    });
    if (data)
      return {
        data: data,
        status: 'true',
        message: 'Get Uids Successfully',
      };
    return {
      data: {},
      status: 'false',
      message: 'Get Uids Failed',
    };
  }
}

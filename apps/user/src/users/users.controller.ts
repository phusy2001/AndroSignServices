import { Ctx, MessagePattern, RmqContext } from '@nestjs/microservices';
import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Delete,
  Param,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { AuthGuard } from 'libs/shared/src/lib/guards/auth.guard';
import { UserId } from '@androsign-microservices/shared';

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
        message: 'Tạo người dùng thành công.',
      };
    }

    return {
      data: {},
      status: 'false',
      message: 'Tạo người dùng thất bại.',
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
        message: 'Lấy toàn bộ người dùng thành công.',
      };
    }

    return {
      data: {},
      status: 'false',
      message: 'Lấy toàn bộ người dùng thất bại.',
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
  @UseGuards(AuthGuard)
  async delete(@Param('id') uid: string) {
    const user = await this.usersService.find(uid);

    if (!user) {
      return {
        data: {},
        status: 'false',
        message: `Không tìm thấy người dùng với id ${uid}`,
      };
    }

    const result = await this.usersService.delete(uid);

    if (result.deletedCount > 0) {
      return {
        data: {},
        status: 'true',
        message: `Xoá người dùng với id ${uid} thành công`,
      };
    }

    return {
      data: {},
      status: 'false',
      message: `Xoá người dùng với id ${uid} thất bại`,
    };
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
      return {
        data: {},
        status: 'true',
        message: `Người dùng với ${uid} đã vô hiệu hoá`,
      };
    } else {
      return {
        data: {},
        status: 'true',
        message: `Người dùng với ${uid} đã mở lại`,
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
          message: 'Get User By Email Successfully',
        };
      return {
        data: {},
        status: 'false',
        message: 'Cannot add yourself',
      };
    }
    return {
      data: {},
      status: 'false',
      message: 'Get User By Email Failed',
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
        expireAfter
      );

      return {
        data: user,
        status: 'true',
        message: 'Create User Ca successfully',
      };
    } catch (error) {
      console.log(error);
    }
  }

  @MessagePattern('get_users_from_list_uid')
  async findByListUid(uidList: [string]) {
    const result = await this.usersService.findByListUid(uidList);

    if (result.length > 0) {
      return {
        data: result,
        status: 'true',
        message: 'Lấy danh sách người dùng từ danh sách uid thành công',
      };
    }

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
}

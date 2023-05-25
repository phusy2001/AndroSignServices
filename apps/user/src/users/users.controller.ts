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
import { AuthGuard } from '../app/commons/guard/auth.guard';

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

  @Get('email/:email')
  @UseGuards(AuthGuard)
  async findByEmail(@Param('email') email: string) {
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

    if (result.acknowledged === true) {
      const updatedUser = await this.usersService.find(uid);

      return {
        data: updatedUser,
        status: 'true',
        message: `Cập nhật người dùng với id ${uid} thành công`,
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
}

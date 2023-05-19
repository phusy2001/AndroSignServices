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
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async find(@Param('id') id: string) {
    const user = await this.usersService.find(id);

    if (user) {
      return {
        data: user,
        status: 'true',
        message: 'Lấy người dùng bằng Id thành công',
      };
    }

    return {
      data: {},
      status: 'false',
      message: 'Lấy người dùng bằng Id thất bại',
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
        message: 'Get User By Email Successfully.',
      };
    return {
      data: {},
      status: 'false',
      message: 'Get User By Email Failed.',
    };
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  update(@Param('id') uid: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(uid, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  delete(@Param('id') uid: string) {
    return this.usersService.delete(uid);
  }
}

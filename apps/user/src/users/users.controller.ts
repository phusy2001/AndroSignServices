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
  find(@Param('id') uid: string) {
    return this.usersService.find(uid);
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

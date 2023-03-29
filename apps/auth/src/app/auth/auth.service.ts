/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import {
  CreateUserDto,
  LoginUserDto,
} from 'apps/user/src/app/users/dto/user.dto';
import { User } from 'apps/user/src/app/users/entity/user.entity';
import { UserService } from 'apps/user/src/app/users/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private config: ConfigService
  ) {}

  async signup(dto: CreateUserDto) {
    const user = await this.userService.create(dto);

    delete user.password;

    return {
      data: { ...user },
      statusCode: 200,
      message: 'Đăng ký người dùng thành công.',
    };
  }

  async validateUser(username: string) {
    const user = await this.userService.getByUsername(username);

    if (!user) {
      throw new BadRequestException();
    }

    return user;
  }

  async login(loginDto: LoginUserDto) {
    const user = await this.userService.getByLogin(loginDto);
    const token = await this.signToken(user);

    delete user.password;
    delete user.refreshToken;

    return {
      data: user,
      metadata: token,
      statusCode: 200,
      message: 'Đăng nhập thành công.',
    };
  }

  async signToken(user: User, refresh = false) {
    const accessToken = this.jwtService.sign({
      username: user.username,
      id: user.id,
      role: user.role,
    });

    if (!refresh) {
      const refreshToken = this.jwtService.sign(
        { username: user.username },
        {
          secret: this.config.get('JWT_REFRESH_TOKEN_SECRET'),
          expiresIn: this.config.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
        }
      );

      await this.userService.updateRefreshToken(user.username, refreshToken);

      return {
        accessToken,
        expiresIn: this.config.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
        refreshToken,
        refreshExpiresIn: this.config.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
      };
    } else {
      return {
        accessToken,
        expiresIn: this.config.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
      };
    }
  }
}

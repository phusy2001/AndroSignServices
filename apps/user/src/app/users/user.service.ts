import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { compareSync, hash } from 'bcrypt';

import { CreateUserDto, LoginUserDto } from './dto/user.dto';
import { User } from './entity/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const existedUsername = await this.userRepository.findOneBy({
      username: dto.username,
    });

    if (existedUsername) {
      throw new BadRequestException();
    }

    const existedEmail = await this.userRepository.findOneBy({
      email: dto.email,
    });

    if (existedEmail) {
      throw new BadRequestException();
    }

    const hashPassword = await hash(dto.password, 10);

    return this.userRepository.save({ ...dto, password: hashPassword });
  }

  getByUsername(username: string): Promise<User | undefined> {
    return this.userRepository.findOneBy({ username });
  }

  async getByLogin({ username, password }: LoginUserDto): Promise<User> {
    const user = await this.userRepository.findOneBy({ username });

    if (!user) {
      throw new BadRequestException();
    }

    const checkPassword = compareSync(password, user.password);

    if (!checkPassword) {
      throw new BadRequestException();
    }

    return user;
  }

  updateRefreshToken(
    username: string,
    refreshToken: string
  ): Promise<UpdateResult> {
    return this.userRepository.update({ username }, { refreshToken });
  }
}

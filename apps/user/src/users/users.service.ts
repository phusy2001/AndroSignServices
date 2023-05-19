import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/users.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  create(dto: CreateUserDto) {
    return new this.userModel(dto).save();
  }

  findAll() {
    return this.userModel.find().exec();
  }

  async find(uid: string) {
    return await this.userModel
      .findOne({ uid })
      .select({ displayName: 1, email: 1 });
  }

  async findByEmail(email: string) {
    return await this.userModel
      .findOne({ email })
      .select({ displayName: 1, uid: 1 });
  }

  update(uid: string, dto: UpdateUserDto) {
    return this.userModel.updateOne({ uid }, dto);
  }

  delete(uid: string) {
    return this.userModel.deleteOne({ uid });
  }
}

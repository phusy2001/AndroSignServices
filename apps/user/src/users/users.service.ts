import { Injectable } from '@nestjs/common';
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

  find(uid: string) {
    return this.userModel.findOne({ uid });
  }

  update(uid: string, dto: UpdateUserDto) {
    return this.userModel.updateOne({ uid }, dto);
  }

  delete(uid: string) {
    return this.userModel.deleteOne({ uid });
  }
}

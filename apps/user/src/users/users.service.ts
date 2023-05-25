import { Injectable } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/users.schema';
import { auth } from 'firebase-admin';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';

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

  findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  update(uid: string, dto: UpdateUserDto) {
    return this.userModel.updateOne({ uid }, dto);
  }

  delete(uid: string) {
    return this.userModel.deleteOne({ uid });
  }

  async changeStatus(uid: string): Promise<UserRecord> {
    const user = await auth().getUser(uid);
    const currentStatus = user.disabled;

    return auth().updateUser(uid, { disabled: !currentStatus });
  }
}

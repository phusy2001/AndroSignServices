import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

@Injectable()
export class AppService {
  constructor() // @Inject('UserToken')
  // private userTokenModel: Model<UserToken>
  {}

  getData(): { message: string } {
    return { message: 'Welcome to background!' };
  }

  // async createFCMToken(data: string) {
  //   const token = new this.userTokenModel({
  //     id: '1',
  //     fcm_token: data,
  //     user_id: 'sy',
  //   });
  //   return token.save();
  // }
}

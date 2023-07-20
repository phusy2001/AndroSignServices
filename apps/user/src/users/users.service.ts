import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/users.schema';
import { auth } from 'firebase-admin';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';
import { ClientProxy } from '@nestjs/microservices';
import { defaultIfEmpty, lastValueFrom } from 'rxjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @Inject('REDIS_CLIENT') private readonly redisClient: any,
    @Inject('ESIGNATURE_SERVICE') private esignatureService: ClientProxy
  ) {}

  async create(dto: CreateUserDto) {
    try {
      const user = await new this.userModel(dto).save();

      await this.redisClient.set('user', JSON.stringify(user));

      return user;
    } catch (e) {
      console.log(e);
    }
  }

  findAll() {
    return this.userModel.find().exec();
  }

  async find(uid: string) {
    const user = await this.userModel.findOne({ uid }).select({
      display_name: 1,
      email: 1,
      fcm_tokens: 1,
      uid: 1,
      phone_number: 1,
      address: 1,
    });

    await this.redisClient.set('user', JSON.stringify(user));

    return user;
  }

  async getCreatedDate(uid: string) {
    const user = await this.userModel.findOne({ uid }).select({
      created_at: 1,
    });

    return user;
  }

  async findByEmail(email: string) {
    const user = await this.userModel
      .findOne({ email })
      .select({ display_name: 1, uid: 1 });

    await this.redisClient.set('user', JSON.stringify(user));

    return user;
  }

  async findByListUid(uidList: [string]) {
    const users = uidList.map(async (uid) => {
      const user = await this.userModel
        .findOne({ uid })
        .select({ email: true, display_name: 1, uid: 1 });

      return user;
    });

    const result = await Promise.all(users);

    return result;
  }

  async update(uid: string, dto: UpdateUserDto) {
    const user = await this.userModel.findOneAndUpdate({ uid }, dto, {
      new: true,
    });

    await this.redisClient.set('user', JSON.stringify(user));

    return user;
  }

  async delete(uid: string) {
    const user = this.userModel.deleteOne({ uid });

    await this.redisClient.del('user');

    return user;
  }

  async changeStatus(uid: string): Promise<UserRecord> {
    const user = await auth().getUser(uid);
    const currentStatus = user.disabled;

    return auth().updateUser(uid, { disabled: !currentStatus });
  }

  async getFcmToken(uid: string) {
    return await this.userModel.findOne({ uid }).select({ fcm_tokens: 1 });
  }

  async removeFcmToken(uid: string, fcmToken: string) {
    const user = await this.getFcmToken(uid);

    const fcmTokenList = user?.fcm_tokens;

    const index = fcmTokenList?.indexOf(fcmToken);

    fcmTokenList?.splice(index, 1);

    return this.userModel.updateOne({ uid: uid }, { fcm_tokens: fcmTokenList });
  }

  async createUserCa(
    email: string,
    uid: string,
    passwordCa: string,
    expireAfter: number
  ) {
    try {
      const encryptedPasswordCa = await lastValueFrom(
        this.esignatureService.send('encrypt_password_ca', passwordCa)
      );

      const data = await lastValueFrom(
        this.esignatureService
          .send('create_self_ca', {
            issued: email,
            password: encryptedPasswordCa.data,
            fileName: `${uid}.pfx`,
            expireAfter,
          })
          .pipe(defaultIfEmpty([]))
      );

      if (data.message === 'Created') {
        const result = await this.userModel.findOneAndUpdate(
          { uid },
          { password_ca: encryptedPasswordCa.data },
          { new: true }
        );

        return result;
      }

      return {
        data: {},
        status: 'false',
        message: 'Tạo CA không thành công',
      };
    } catch (error) {
      console.log(error);
    }
  }

  async updateUserCa(
    email: string,
    uid: string,
    nPasswordCa: string,
    oPasswordCa: string
  ) {
    try {
      const encryptedOPasswordCa = await lastValueFrom(
        this.esignatureService.send('encrypt_password_ca', oPasswordCa)
      );
      const encryptedNPasswordCa = await lastValueFrom(
        this.esignatureService.send('encrypt_password_ca', nPasswordCa)
      );
      const data = await lastValueFrom(
        this.esignatureService
          .send('create_self_ca', {
            issued: email,
            password: encryptedOPasswordCa.data,
            fileName: `${uid}.pfx`,
            isUpdate: true,
            newPass: encryptedNPasswordCa.data,
          })
          .pipe(defaultIfEmpty([]))
      );
      return data;
    } catch (error) {
      console.log(error);
    }
  }

  async getAdminInfo(email: string) {
    return await this.userModel.findOne(
      { email: email, role: 'admin' },
      { display_name: 1, phone_number: 1, address: 1 }
    );
  }

  async getTotalCount() {
    return await this.userModel.countDocuments({});
  }

  async getRecentUsersCount(days: number) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return await this.userModel.countDocuments({
      created_at: { $gte: startDate },
    });
  }

  async getUsersCountInYear(year: number) {
    return await this.userModel.aggregate([
      {
        $match: {
          created_at: {
            $gte: new Date(year, 0, 1),
            $lte: new Date(year, 11, 31),
          },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: '$created_at' },
            year: { $year: '$created_at' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.month': 1 } },
    ]);
  }

  async getCustomers(page, limit) {
    const skip = (page - 1) * limit;
    const users = await this.userModel.find().skip(skip).limit(limit).exec();
    return users;
  }

  async getCustomersQty() {
    const users = await this.userModel.find();
    return users.length;
  }

  async getUidsByKeyword(keyword: string) {
    const regex = new RegExp(`.*${keyword}.*`, 'i');
    return await this.userModel
      .find({ email: { $regex: regex } })
      .select({ uid: 1, _id: 0 });
  }
}

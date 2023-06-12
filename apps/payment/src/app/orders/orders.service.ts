import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import moment from 'moment';
import CryptoJS from 'crypto-js';
import qs from 'qs';

import { Order } from './entities/order.entity';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class OrdersService {
  private config = {
    app_id: `${process.env.APP_ID}`,
    key1: `${process.env.KEY1}`,
    key2: `${process.env.KEY2}`,
    endpoint: 'https://sb-openapi.zalopay.vn/v2/create',
  };

  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @Inject('REDIS_CLIENT') private readonly redisClient: any,
    @Inject('USER_SERVICE') private readonly clientProxy: ClientProxy
  ) {}

  async test() {
    const user = await this.redisClient.get('user');
    if (user) {
      console.log('Cached', user);
      await this.redisClient.del('user');
    } else {
      const tempUser = await lastValueFrom(
        this.clientProxy.send('get_user_by_email', '2121@gmail.com')
      );
      await this.redisClient.set('user', JSON.stringify(tempUser));
      console.log('new User', user);
    }
  }

  async create() {
    // APP INFO

    const embed_data = {};

    const items = [{}];
    const transID = Math.floor(Math.random() * 1000000);
    const order = {
      app_id: this.config.app_id,
      app_trans_id: `${moment().format('YYMMDD')}_${transID}`, // translation missing: vi.docs.shared.sample_code.comments.app_trans_id
      app_user: 'user123',
      app_time: Date.now(), // miliseconds
      item: JSON.stringify(items),
      embed_data: JSON.stringify(embed_data),
      amount: 33000,
      description: `Gói 1 tháng - Payment for the order #${transID}`,
      bank_code: 'zalopayapp',
      mac: '',
    };

    console.log('app_trans_id', order.app_trans_id);

    // appid|app_trans_id|appuser|amount|apptime|embeddata|item
    const data =
      this.config.app_id +
      '|' +
      order.app_trans_id +
      '|' +
      order.app_user +
      '|' +
      order.amount +
      '|' +
      order.app_time +
      '|' +
      order.embed_data +
      '|' +
      order.item;
    order.mac = CryptoJS.HmacSHA256(data, this.config.key1).toString();

    return await axios.post(this.config.endpoint, null, { params: order });
  }

  async getStatus(app_trans_id: string) {
    const postData = {
      app_id: this.config.app_id,
      app_trans_id: app_trans_id, // Input your app_trans_id,
      mac: '',
    };

    const data =
      postData.app_id + '|' + postData.app_trans_id + '|' + this.config.key1; // appid|app_trans_id|key1
    postData.mac = CryptoJS.HmacSHA256(data, this.config.key1).toString();

    const postConfig = {
      method: 'post',
      url: 'https://sb-openapi.zalopay.vn/v2/query',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: qs.stringify(postData),
    };

    console.log('get app_trans_id', app_trans_id);

    return await axios(postConfig);
  }

  async updateStatus(order_id: string, status_code: number) {
    const order = await this.orderModel.findOne({ order_id: order_id });
    if (!order) {
      throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    }
    order.status = status_code;
    await order.save();
    return order;
  }
}

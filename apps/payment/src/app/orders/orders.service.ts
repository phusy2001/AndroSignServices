import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import moment from 'moment';
import CryptoJS from 'crypto-js';
import qs from 'qs';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { PlansService } from '../plans/plans.service';
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
    private planService: PlansService,
    @Inject('USER_SERVICE') private userService: ClientProxy,
    @Inject('DOCUMENT_SERVICE') private docService: ClientProxy
  ) {}

  async create(orderDto: CreateOrderDto) {
    // APP INFO
    const plan = await this.planService.getPlanById(orderDto.plan_id);

    const items = [{}];
    const transID = Math.floor(Math.random() * 1000000);
    const item = [
      {
        itemid: plan.plan_id,
        itemname: plan.plan_name,
        itemprice: plan.plan_price,
        itemquantity: 1,
      },
    ];
    const embed_data = {
      promotioninfo: '',
      merchantinfo: JSON.stringify(item),
    };

    const order = {
      app_id: this.config.app_id,
      app_trans_id: `${moment().format('YYMMDD')}_${transID}`, // translation missing: vi.docs.shared.sample_code.comments.app_trans_id
      app_user: orderDto.user_id,
      app_time: Date.now(), // miliseconds
      item: JSON.stringify(items),
      embed_data: JSON.stringify(embed_data),
      amount: plan.plan_price,
      description: `Androsign - ${plan.plan_name} - Payment for the order #${transID}`,
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

    const res = await axios.post(this.config.endpoint, null, {
      params: order,
    });

    const orderData = new Order();

    orderData.user_id = orderDto.user_id;
    orderData.order_id = order.app_trans_id;
    orderData.plan_id = orderDto.plan_id;
    orderData.status = 2;
    orderData.total_tax = 0;
    orderData.total_price = plan.plan_price;
    orderData.expired_on = new Date(
      new Date().setDate(new Date().getDate() + plan.duration)
    );
    const orderDataTemp = await this.orderModel.create(orderData);
    orderDataTemp.save();

    console.log(res);

    return { order_url: res.data.order_url, app_trans_id: orderData.order_id };
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

  async getOrder(order_id: string) {
    return await this.orderModel.findOne({ order_id });
  }

  async getIncomeInYear(year: number) {
    return await this.orderModel.aggregate([
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
          total: { $sum: '$total_price' },
        },
      },
    ]);
  }

  async getOrdersAdmin(
    offset: number,
    sort: string,
    order: string,
    status: string,
    uidList: Array<string>,
    keyword: string
  ) {
    const numLimit = 10;
    const query = this.orderModel.find();
    if (keyword !== '') query.find({ user_id: { $in: uidList } });
    if (status === 'success') query.find({ status: 1 });
    else if (status === 'fail') query.find({ status: 2 });
    else if (status === 'processing') query.find({ status: 3 });
    const total = await this.orderModel.countDocuments(query);
    if (sort === 'date')
      query.sort({ order_date: `${order === 'asc' ? 'asc' : 'desc'}` });
    else if (sort === 'price')
      query.sort({ total_price: `${order === 'asc' ? 'asc' : 'desc'}` });
    query.limit(numLimit);
    query.skip(offset * numLimit);
    const data = await query.exec();
    return { data, total };
  }

  async getUidsByKeyword(keyword: string) {
    return await lastValueFrom(
      this.userService.send('get_uids_by_keyword', keyword)
    );
  }

  async getUsersByIdArr(ids: string[]) {
    return await lastValueFrom(
      this.userService.send('get_users_from_list_uid', ids)
    );
  }

  async getUserValidOrder(userId: string) {
    const now = new Date();
    return await this.orderModel.findOne(
      {
        user_id: userId,
        status: 1,
        expired_on: { $gt: now },
      },
      { plan_id: 1, expired_on: 1 }
    );
  }

  async getUserUsage(id: string) {
    return await lastValueFrom(this.docService.send('get_user_usage', id));
  }
}

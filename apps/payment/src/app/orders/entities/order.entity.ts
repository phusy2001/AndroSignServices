import { Schema } from '@nestjs/mongoose';
import { Prop } from '@nestjs/mongoose/dist';
import { OrderItem } from './order-item.entity';

@Schema()
export class Order {
  @Prop()
  app_id: number;

  @Prop()
  app_user: string;

  @Prop()
  app_trans_id: string;

  @Prop()
  app_time: number;
  
  @Prop()
  amount: number;

  @Prop()
  item: OrderItem[];

  @Prop()
  description: string;

  @Prop()
  embed_data: string;

  @Prop()
  bank_code:string;

  @Prop()
  mac: string;

  @Prop()
  callback_url: string

  @Prop()
  device_info: string;

  @Prop()
  sub_app_id:string;

  @Prop()
  title: string;

  @Prop()
  currency: string;

  @Prop()
  phone: string;

  @Prop()
  email: string;

  @Prop()
  address: string;
}

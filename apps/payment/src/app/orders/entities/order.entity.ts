import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';

enum Status {
  SUCCESS,
  FAIL,
  PROCESSING,
}

@Schema()
export class Order {
  @Prop()
  order_id: string;

  @Prop({ required: true })
  user_id: string;

  @Prop({ required: true })
  plan_id: string;

  @Prop({
    default: () => {
      return new Date();
    },
  })
  order_date: Date;

  @Prop({ type: Number, enum: Status, default: Status.PROCESSING })
  status: Status;

  @Prop({ required: true })
  total_tax: number;

  @Prop({ required: true })
  total_price: number;

  @Prop({
    default: () => {
      return new Date();
    },
  })
  created_at: Date;

  @Prop({
    default: () => {
      return new Date();
    },
  })
  updated_at: Date;

  @Prop()
  user_name: string;

  @Prop()
  user_email: string;

  @Prop()
  plan_name: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

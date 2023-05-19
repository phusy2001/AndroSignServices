import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Notification extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  body: string;

  @Prop()
  data: string;

  @Prop({ required: true })
  device_token: string;

  @Prop()
  icon_url: string;

  @Prop()
  click_action_url: string;

  @Prop({ default: Date.now })
  created_at: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

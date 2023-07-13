import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export enum Role {
  ADMIN = 'admin',
  EMPLOYEE = 'customer',
}

@Schema()
export class User {
  @Prop()
  display_name: string;

  @Prop()
  uid: string;

  @Prop({ unique: true })
  email: string;

  @Prop({ required: false })
  phone_number: string;

  @Prop({ required: false })
  address: string;

  @Prop({ default: 'customer' })
  role: Role;

  @Prop([String])
  fcm_tokens: string[];

  @Prop()
  password_ca: string;

  @Prop({ default: now() })
  created_at: Date;

  @Prop({ default: now() })
  updated_at: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

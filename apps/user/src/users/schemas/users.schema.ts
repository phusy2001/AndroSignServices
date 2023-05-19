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
  displayName: string;

  @Prop()
  uid: string;

  @Prop({ unique: true })
  email: string;

  @Prop({ required: false })
  phoneNumber: string;

  @Prop({ default: 'customer' })
  role: Role;

  @Prop([String])
  fcmTokens: string[];

  @Prop({ default: now() })
  createdAt: Date;

  @Prop({ default: now() })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

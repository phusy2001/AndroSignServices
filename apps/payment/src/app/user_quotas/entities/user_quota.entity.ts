import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class UserQuota {
  @Prop()
  user_id: string;

  @Prop()
  plan_type: string;

  @Prop({ default: 0 })
  files_count: number;

  @Prop({ default: 0 })
  folders_count: number;

  @Prop({ default: 5 })
  max_files: number;

  @Prop({ default: 1 })
  max_folders: number;

  @Prop({ default: null })
  expire_date: Date;

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
}

export const UserQuotaSchema = SchemaFactory.createForClass(UserQuota);
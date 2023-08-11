import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema()
export class Plan {
  @Prop({
    type: String,
    default: function genUUID() {
      return uuidv4();
    },
  })
  plan_id: string;

  @Prop({ required: true, maxlength: 100 })
  plan_name: string;

  @Prop()
  plan_description: string;

  @Prop({ maxlength: 20 })
  plan_type: string;

  @Prop()
  plan_price: number;

  @Prop()
  plan_price_view: number;

  @Prop({
    type: [
      { unlimited_folder: { type: Number }, unlimited_files: { type: Number } },
    ],
  })
  quotas: { unlimited_folder: number; unlimited_files: number }[];

  @Prop()
  duration: number;

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

export const PlanSchema = SchemaFactory.createForClass(Plan);

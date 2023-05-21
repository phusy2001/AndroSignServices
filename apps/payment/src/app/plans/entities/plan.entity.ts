import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Plan {
  @Prop({ required: true })
  plan_id: string;

  @Prop({ required: true, maxlength: 100 })
  plan_name: string;

  @Prop()
  plan_description: string;

  @Prop({ maxlength: 20 })
  plan_type: string;

  @Prop()
  plan_price: number;

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

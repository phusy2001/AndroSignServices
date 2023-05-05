import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class OrderItem {
  @Prop()
  itemid: string;

  @Prop()
  itemname: string;

  @Prop()
  itemprice: string;

  @Prop()
  itemquantity: string;
}

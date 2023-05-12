import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';

export type FileDocument = File & Document;

@Schema()
export class File {
  _id: string;
  @Prop({ required: true })
  name: string;
  @Prop({ default: 'null' })
  user: string;
  @Prop({ default: null })
  path: string;
  @Prop({ default: null })
  xfdf: Buffer;
  @Prop({ default: false })
  deleted: Boolean;
  @Prop({ default: [] })
  starred: Array<string>;
  @Prop({ default: [] })
  sharedTo: Array<string>;
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

export const FileSchema = SchemaFactory.createForClass(File);

FileSchema.index({
  name: 'text',
});

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';

export type FileDocument = File & Document;

@Schema()
export class File {
  _id: string;
  @Prop({ required: true })
  name: string;
  @Prop({ default: null })
  user: ObjectId;
  @Prop({ default: null })
  path: String;
  @Prop({ default: null })
  xfdf: Buffer;
  @Prop({ default: false })
  deleted: Boolean;
  @Prop({ default: false })
  starred: Boolean;
  @Prop({ default: [] })
  sharedTo: Array<String>;
  @Prop({ default: new Date() })
  created_at: Date;
  @Prop({ default: new Date() })
  updated_at: Date;
}

export const FileSchema = SchemaFactory.createForClass(File);

FileSchema.index({
  name: 'text',
});

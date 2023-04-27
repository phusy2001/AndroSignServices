import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';

export type FolderDocument = Folder & Document;

@Schema()
export class Folder {
  _id: string;
  @Prop({ required: true })
  name: string;
  @Prop({ default: null })
  user: ObjectId;
  @Prop({ default: [] })
  files: Array<string>;
  @Prop({ default: new Date() })
  created_at: Date;
  @Prop({ default: new Date() })
  updated_at: Date;
}

export const FolderSchema = SchemaFactory.createForClass(Folder);

FolderSchema.index({
  name: 'text',
});

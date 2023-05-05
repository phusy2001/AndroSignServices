import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { File, FileSchema } from './schemas/file.schema';
import { FileService } from './services/file.service';
import { S3Service } from './services/s3.service';
import { FolderService } from './services/folder.service';
import { Folder, FolderSchema } from './schemas/folder.schema';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(
      `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}/?${process.env.MONGODB_OPTIONS}`,
      {
        dbName: 'DocumentService',
      }
    ),
    MongooseModule.forFeature([{ name: File.name, schema: FileSchema }]),
    MongooseModule.forFeature([{ name: Folder.name, schema: FolderSchema }]),
  ],
  controllers: [AppController],
  providers: [AppService, FileService, S3Service, FolderService],
})
export class AppModule {}

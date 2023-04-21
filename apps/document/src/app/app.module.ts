import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { File, FileSchema } from './schemas/file.schema';
import { FileService } from './services/file.service';
import { S3Service } from './services/s3.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGODB_URI, {
      dbName: 'DocumentService',
    }),
    MongooseModule.forFeature([{ name: File.name, schema: FileSchema }]),
  ],
  controllers: [AppController],
  providers: [AppService, FileService, S3Service],
})
export class AppModule {}

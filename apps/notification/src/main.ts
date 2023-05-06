import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as admin from 'firebase-admin';
import { AppModule } from './app/app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService: ConfigService = app.get(ConfigService);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [
        `amqp://${configService.get<string>(
          'RABBITMQ_USER'
        )}:${configService.get<string>(
          'RABBITMQ_PASSWORD'
        )}@${configService.get<string>('RABBITMQ_HOST')}`,
      ],
      queue: 'notification_queue',
      noAck: false,
      queueOptions: {
        durable: true,
      },
    },
  });

  // Initialize the firebase admin app
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: configService.get<string>('FIREBASE_PROJECT_ID'),
      privateKey: configService
        .get<string>('FIREBASE_PRIVATE_KEY')
        .replace(/\\n/g, '\n'),
      clientEmail: configService.get<string>('FIREBASE_CLIENT_EMAIL'),
    }),
    databaseURL: 'https://xxxxx.firebaseio.com',
  });

  await app.startAllMicroservices();
  await app.listen(
    configService.get<string>('NOTIFICATION_SERVICE_PORT') || 3003
  );
}
bootstrap();

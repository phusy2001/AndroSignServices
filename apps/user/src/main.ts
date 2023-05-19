import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService: ConfigService = app.get(ConfigService);

  // app.connectMicroservice<MicroserviceOptions>({
  //   transport: Transport.RMQ,
  //   options: {
  //     urls: [
  //       `amqp://${configService.get<string>(
  //         'RABBITMQ_USER'
  //       )}:${configService.get<string>(
  //         'RABBITMQ_PASSWORD'
  //       )}@${configService.get<string>('RABBITMQ_HOST')}`,
  //     ],
  //     queue: 'user_queue',
  //     noAck: false,
  //     queueOptions: {
  //       durable: true,
  //     },
  //   },
  // });

  // await app.startAllMicroservices();
  await app.listen(configService.get<string>('USER_SERVICE_PORT') || 3005);
}

bootstrap();

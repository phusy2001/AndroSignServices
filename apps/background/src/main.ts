import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const configService: ConfigService = app.get(ConfigService);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [
        `amqps://${configService.get<string>(
          'RABBITMQ_USER'
        )}:${configService.get<string>(
          'RABBITMQ_PASSWORD'
        )}@${configService.get<string>(
          'RABBITMQ_HOST'
        )}:${configService.get<string>('RABBITMQ_PORT')}`,
      ],
      queue: 'background_queue',
      noAck: true,
      queueOptions: {
        durable: true,
      },
    },
  });

  app.setGlobalPrefix('background');

  await app.startAllMicroservices();
  await app.listen(
    configService.get<string>('BACKGROUND_SERVICE_PORT') || 3003
  );
}
bootstrap();

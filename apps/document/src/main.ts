import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config';
import bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  const configService: ConfigService = app.get(ConfigService);

  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

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
      queue: 'document_queue',
      noAck: false,
      queueOptions: {
        durable: true,
      },
    },
  });
  await app.startAllMicroservices();
  await app.listen(configService.get<string>('DOCUMENT_SERVICE_PORT') || 3001);
}

bootstrap();

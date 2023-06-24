import { ClientsModule, Transport } from '@nestjs/microservices';
import { Global, Module } from '@nestjs/common';
import { createClient } from 'redis';
import { AuthGuard } from './guards/auth.guard';

@Global()
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'DOCUMENT_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [
            `amqps://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`,
          ],
          queue: 'document_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
    ClientsModule.register([
      {
        name: 'BACKGROUND_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [
            `amqps://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`,
          ],
          queue: 'background_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
    ClientsModule.register([
      {
        name: 'PAYMENT_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [
            `amqps://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`,
          ],
          queue: 'payment_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [
            `amqps://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`,
          ],
          queue: 'user_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
    ClientsModule.register([
      {
        name: 'ESIGNATURE_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [
            `amqps://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`,
          ],
          queue: 'esignature_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: async () => {
        const client = createClient({
          url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
          username: `${process.env.REDIS_USERNAME}`,
          password: `${process.env.REDIS_PASSWORD}`,
        });

        await client.connect();
        return client;
      },
    },
    AuthGuard,
  ],
  exports: ['REDIS_CLIENT', ClientsModule, AuthGuard],
})
export class SharedModule {}

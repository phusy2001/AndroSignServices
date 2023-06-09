import { Module } from '@nestjs/common';
import { createClient } from 'redis';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersModule } from './orders/orders.module';
import { PlansModule } from './plans/plans.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(
      `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}/?${process.env.MONGODB_OPTIONS}`
    ),
    OrdersModule,
    PlansModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
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
  ],
})
export class AppModule {}

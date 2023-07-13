import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersModule } from './orders/orders.module';
import { PlansModule } from './plans/plans.module';
import { UserQuotasModule } from './user_quotas/user_quotas.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(
      `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}/?${process.env.MONGODB_OPTIONS}`,
      {
        dbName: 'PaymentService',
      }
    ),
    OrdersModule,
    PlansModule,
    UserQuotasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

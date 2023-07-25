import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersModule } from './orders/orders.module';
import { PlansModule } from './plans/plans.module';
import { UserQuotasModule } from './user_quotas/user_quotas.module';
import { PlansService } from './plans/plans.service';
import { Plan, PlanSchema } from './plans/entities/plan.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(
      `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}/?${process.env.MONGODB_OPTIONS}`,
      { dbName: 'PaymentService' }
    ),
    MongooseModule.forFeature([{ name: Plan.name, schema: PlanSchema }]),
    OrdersModule,
    PlansModule,
    UserQuotasModule,
  ],
  controllers: [AppController],
  providers: [AppService, PlansService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './entities/order.entity';
import { SharedModule } from '@androsign-microservices/shared';
import { PlansModule } from '../plans/plans.module';
import { PlansService } from '../plans/plans.service';
import { Plan, PlanSchema } from '../plans/entities/plan.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    MongooseModule.forFeature([{ name: Plan.name, schema: PlanSchema }]),
    SharedModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, PlansService],
})
export class OrdersModule {}

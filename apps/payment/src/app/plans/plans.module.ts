import { Module } from '@nestjs/common';
import { PlansService } from './plans.service';
import { PlansController } from './plans.controller';
import { SharedModule } from '@androsign-microservices/shared';
import { Plan, PlanSchema } from './entities/plan.entity';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Plan.name, schema: PlanSchema }]),
    SharedModule,
  ],
  controllers: [PlansController],
  providers: [PlansService],
})
export class PlansModule {}

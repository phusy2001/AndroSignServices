import { Module } from '@nestjs/common';
import { UserQuotasService } from './user_quotas.service';
import { UserQuotasController } from './user_quotas.controller';
import { SharedModule } from '@androsign-microservices/shared';
import { MongooseModule } from '@nestjs/mongoose';
import { UserQuota, UserQuotaSchema } from './entities/user_quota.entity';
import { Plan, PlanSchema } from '../plans/entities/plan.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserQuota.name, schema: UserQuotaSchema },
    ]),
    MongooseModule.forFeature([{ name: Plan.name, schema: PlanSchema }]),
    SharedModule,
  ],
  controllers: [UserQuotasController],
  providers: [UserQuotasService],
})
export class UserQuotasModule {}

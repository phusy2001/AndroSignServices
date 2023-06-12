import { Module } from '@nestjs/common';
import { PlansService } from './plans.service';
import { PlansController } from './plans.controller';
import { SharedModule } from '@androsign-microservices/shared';

@Module({
  imports: [SharedModule],
  controllers: [PlansController],
  providers: [PlansService],
})
export class PlansModule {}

import { PartialType } from '@nestjs/mapped-types';
import { CreatePlanDto } from './create-plan.dto';

export class UpdatePlanDto extends PartialType(CreatePlanDto) {
  plan_name: string;
  plan_description: string;
  plan_type: string;
  plan_price: number;
}

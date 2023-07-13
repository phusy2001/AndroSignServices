import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PlansService } from './plans.service';
import { CreatePlanDto } from './dto/create-plan.dto';

@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  async getPlans() {
    return this.plansService.getPlans();
  }

  @Get(':id')
  async getPlanById(@Param('id') plan_id: string) {
    return this.plansService.getPlanById(plan_id);
  }

  @Post()
  async createPlan(@Body() createPlanDto: CreatePlanDto) {
    return this.plansService.createPlan(createPlanDto);
  }
}

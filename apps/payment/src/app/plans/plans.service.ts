import { Injectable } from '@nestjs/common';
import { Plan } from './entities/plan.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePlanDto } from './dto/create-plan.dto';

@Injectable()
export class PlansService {
  constructor(@InjectModel(Plan.name) private planModel: Model<Plan>) {}

  async getPlans() {
    return await this.planModel.find();
  }

  async getPlanById(plan_id: string) {
    return await this.planModel.findOne({ plan_id });
  }

  async createPlan(createPlanDto: CreatePlanDto) {
    const createdPlan = new this.planModel(createPlanDto);
    return createdPlan.save();
  }

  async checkInitalPlan(plan_name: string, plan_type: string) {
    return await this.planModel.findOne({ plan_name, plan_type });
  }
}

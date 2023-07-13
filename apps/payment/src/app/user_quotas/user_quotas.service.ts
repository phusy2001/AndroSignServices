import { Injectable } from '@nestjs/common';
import { CreateUserQuotaDto } from './dto/create-user_quota.dto';
import { UpdateUserQuotaDto } from './dto/update-user_quota.dto';
import { InjectModel } from '@nestjs/mongoose';
import { UserQuota } from './entities/user_quota.entity';
import { Model } from 'mongoose';
import { UpdateUserQuotaWithPlanDto } from './dto/update-user_quota-with-plan.dto';
import { Plan } from '../plans/entities/plan.entity';

@Injectable()
export class UserQuotasService {
  constructor(
    @InjectModel(UserQuota.name) private userQuotasModel: Model<UserQuota>,
    @InjectModel(Plan.name) private planModel: Model<Plan>
  ) {}

  create(createUserQuotaDto: CreateUserQuotaDto) {
    const user_quotas = new this.userQuotasModel(createUserQuotaDto);
    return user_quotas.save();
  }

  findAll() {
    return `This action returns all userQuotas`;
  }

  findOne(id: number) {
    return `This action returns a #${id} userQuota`;
  }

  async update(
    id: string,
    updateUserQuotaWithPlanDto: UpdateUserQuotaWithPlanDto
  ) {
    const user_quotas = await this.userQuotasModel.findOne({ user_id: id });
    const plan = await this.planModel.findOne({
      plan_id: updateUserQuotaWithPlanDto.plan_id,
    });
    user_quotas.max_files = null;
    user_quotas.max_folders = null;
    user_quotas.expire_date = new Date(
      new Date().setDate(new Date().getDate() + plan.duration)
    );
    user_quotas.updated_at = new Date();  
    user_quotas.plan_type = plan.plan_type;
    await user_quotas.save();
  }

  async remove(id: string) {
    return this.userQuotasModel.deleteOne({ user_id: id });
  }

  async checkQuotas(id: string) {
    const user_quotas = await this.userQuotasModel.findOne({ user_id: id });

    if (!user_quotas) {
      await this.create({ user_id: id, plan_type: 'F' });
      const user_quotas = await this.userQuotasModel.findOne({ user_id: id });
      if (
        user_quotas.files_count === user_quotas.max_files ||
        user_quotas.folders_count === user_quotas.max_folders
      ) {
        return {
          data: false,
          error: 'Không thể thực hiện do vượt quá định mức cho phép',
        };
      }
      return {
        data: true,
        error: 'Chưa vượt định mức cho phép',
      };
    } else {
      if (
        user_quotas.files_count === user_quotas.max_files ||
        user_quotas.folders_count === user_quotas.max_folders
      ) {
        return {
          data: false,
          error: 'Không thể thực hiện do vượt quá định mức cho phép',
        };
      }
      return {
        data: true,
        error: 'Chưa vượt định mức cho phép',
      };
    }
  }

  async getQuotas(id: string) {
    const user_quotas = await this.userQuotasModel.findOne({ user_id: id });
    return user_quotas;
  }
}

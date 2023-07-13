import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UserQuotasService } from './user_quotas.service';
import { CreateUserQuotaDto } from './dto/create-user_quota.dto';
import { UpdateUserQuotaDto } from './dto/update-user_quota.dto';
import { UpdateUserQuotaWithPlanDto } from './dto/update-user_quota-with-plan.dto';

@Controller('user-quotas')
export class UserQuotasController {
  constructor(private readonly userQuotasService: UserQuotasService) {}

  @Post()
  create(@Body() createUserQuotaDto: CreateUserQuotaDto) {
    return this.userQuotasService.create(createUserQuotaDto);
  }

  @Get(':id')
  async getQuotas(@Param('id') id: string) {
    return await this.userQuotasService.getQuotas(id);
  }

  @Get('/check_quotas/:id')
  async checkQuotas(@Param('id') id: string) {
    return await this.userQuotasService.checkQuotas(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserQuotaWithPlanDto: UpdateUserQuotaWithPlanDto
  ) {
    return this.userQuotasService.update(id, updateUserQuotaWithPlanDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.userQuotasService.remove(id);
  }
}

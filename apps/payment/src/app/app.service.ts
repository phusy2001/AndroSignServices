import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { PlansService } from './plans/plans.service';

@Injectable()
export class AppService implements OnApplicationBootstrap {
  constructor(private planService: PlansService) {}

  async onApplicationBootstrap() {
    this.planService
      .checkInitalPlan('GÓI TRẢ PHÍ', 'M1')
      .then((result: any) => {
        if (!result)
          this.planService.createPlan({
            plan_name: 'GÓI TRẢ PHÍ',
            plan_description: 'Gói 1 tháng',
            plan_type: 'M1',
            plan_price: 35000,
            plan_price_view: 35000,
            duration: 30,
            quotas: [],
          });
      });
    this.planService
      .checkInitalPlan('GÓI TRẢ PHÍ', 'M3')
      .then((result: any) => {
        if (!result)
          this.planService.createPlan({
            plan_name: 'GÓI TRẢ PHÍ',
            plan_description: 'Gói 3 tháng',
            plan_type: 'M3',
            plan_price: 100500,
            plan_price_view: 33500,
            duration: 90,
            quotas: [],
          });
      });
    this.planService
      .checkInitalPlan('GÓI TRẢ PHÍ', 'M6')
      .then((result: any) => {
        if (!result)
          this.planService.createPlan({
            plan_name: 'GÓI TRẢ PHÍ',
            plan_description: 'Gói 6 tháng',
            plan_type: 'M6',
            plan_price: 192000,
            plan_price_view: 32000,
            duration: 180,
            quotas: [],
          });
      });
    this.planService
      .checkInitalPlan('GÓI TRẢ PHÍ', 'Annually')
      .then((result: any) => {
        if (!result)
          this.planService.createPlan({
            plan_name: 'GÓI TRẢ PHÍ',
            plan_description: 'Gói 1 năm',
            plan_type: 'Annually',
            plan_price: 360000,
            plan_price_view: 30000,
            duration: 365,
            quotas: [],
          });
      });
  }

  async getData(value: string) {
    return { message: value };
  }
}

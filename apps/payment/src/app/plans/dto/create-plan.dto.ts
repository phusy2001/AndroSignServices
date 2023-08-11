export class CreatePlanDto {
  plan_name: string;
  plan_description: string;
  plan_type: string;
  plan_price: number;
  plan_price_view: number;
  duration: number;
  quotas: Array<any>;
}

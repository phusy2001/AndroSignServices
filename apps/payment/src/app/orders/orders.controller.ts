import { Controller, Get, Param, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async createOrder() {
    try {
      const order = await this.ordersService.create();
      return { data: order.data };
    } catch (error) {
      return error;
    }
  }

  @Get()
  async test() {
    return await this.ordersService.test();
  }

  @Get(':id')
  async getStatus(@Param('id') app_trans_id: string) {
    try {
      const status = await this.ordersService.getStatus(app_trans_id);
      return JSON.stringify(status.data);
    } catch (error) {
      return error;
    }
  }
}

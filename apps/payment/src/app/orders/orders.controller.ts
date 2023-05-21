import { Controller, Get, Param, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';
@Controller('orders')
export class OrdersController {
  private readonly config = {
    key2: 'eG4r0GcoNtRGbO8',
  };

  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async createOrder() {
    try {
      const order = await this.ordersService.create();
      return order.data;
    } catch (error) {
      return error;
    }
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

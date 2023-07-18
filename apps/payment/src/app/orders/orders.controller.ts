import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async createOrder(@Body() orderDto: CreateOrderDto) {
    try {
      const order = await this.ordersService.create(orderDto);
      return { data: order };
    } catch (error) {
      return error;
    }
  }

  @Get('/status/:id')
  async getStatus(@Param('id') app_trans_id: string) {
    try {
      const status = await this.ordersService.getStatus(app_trans_id);
      return JSON.stringify(status.data);
    } catch (error) {
      return error;
    }
  }

  @Get('/admin/getIncomeStatistics')
  async getIncomeStatistics() {
    try {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const data = await this.ordersService.getIncomeInYear(currentYear);
      const arr = [...Array(12)].fill(0);
      data.map((item) => (arr[item._id.month - 1] = item.total));
      return {
        data: {
          year: currentYear,
          data: arr,
        },
        status: 'true',
        message: 'Lấy thống kê doanh thu thành công',
      };
    } catch (error) {
      return error;
    }
  }
}

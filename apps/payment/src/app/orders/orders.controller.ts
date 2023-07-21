import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { PlansService } from '../plans/plans.service';
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly plansService: PlansService
  ) {}

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

  @Patch('/status/:id')
  async updateStatus(@Param('id') app_trans_id: string) {
    try {
      const status = await this.ordersService.getStatus(app_trans_id);
      const order = await this.ordersService.updateStatus(
        app_trans_id,
        status.data
      );
      return { data: order };
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

  @Get('/admin/getOrders')
  async getOrdersAdmin(
    @Query('offset') offset,
    @Query('sort') sort,
    @Query('status') status,
    @Query('keyword') keyword,
    @Query('order') order
  ) {
    try {
      const uids = await this.ordersService.getUidsByKeyword(keyword);
      const data: any = await this.ordersService.getOrdersAdmin(
        offset,
        sort,
        order,
        status,
        uids.data,
        keyword
      );
      for (const item of data.data) {
        const user = await this.ordersService.getUsersByIdArr([item.user_id]);
        item.user_email = user.data[0].email;
        item.user_name = user.data[0].display_name;
        const plan = await this.plansService.getPlanById(item.plan_id);
        item.plan_name = plan.plan_description;
      }
      return {
        data: data,
        status: 'true',
        message: 'Lấy danh sách giao dịch thành công',
      };
    } catch (error) {
      return error;
    }
  }
}

import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { PlansService } from '../plans/plans.service';
import { AuthGuard, UserId } from '@androsign-microservices/shared';

@UseGuards(AuthGuard)
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

  @Post('/status/:id')
  async updateStatus(@Param('id') app_trans_id: string) {
    try {
      const status = await this.ordersService.getStatus(app_trans_id);
      const order = await this.ordersService.updateStatus(
        app_trans_id,
        status.data.return_code
      );
      if (status.data.return_code === 1) {
        this.plansService.getPlanById(order.plan_id).then((plan: any) => {
          this.ordersService
            .getUsersByIdArr([order.user_id])
            .then((user: any) => {
              this.ordersService.sendEmailNotification(
                user.data[0].email,
                'AndroSign thanh toán dịch vụ thành công',
                `Đơn hàng mã <b>${order.order_id}</b> với dịch vụ <b>${
                  plan.plan_name
                }(${
                  plan.plan_description
                })</b> đã được thanh toán thành công với số tiền <b>${formatPrice(
                  order.total_price
                )} VNĐ </b>`,
                'Cảm ơn bạn đã thanh toán dịch vụ của chúng tôi'
              );
            });
        });
      }
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
    @Query('order') order,
    @Query('limit') limit
  ) {
    try {
      const uids = await this.ordersService.getUidsByKeyword(keyword);
      const data: any = await this.ordersService.getOrdersAdmin(
        offset,
        sort,
        order,
        status,
        uids.data,
        keyword,
        limit
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

  @Get('/checkUserPlan')
  async checkUserPlan(@UserId() userId) {
    const order = await this.ordersService.getUserValidOrder(userId);
    if (order) {
      const plan = await this.plansService.getPlanById(order.plan_id);
      if (plan)
        return {
          data: {
            name: plan.plan_name,
            description: plan.plan_description,
            type: plan.plan_type,
            quotas: plan.quotas,
            expired_on: order.expired_on,
          },
          status: 'true',
          message: 'Lấy thông tin gói của người dùng thành công',
        };
    }
    const user = await this.ordersService.getUserUsage(userId);
    return {
      data: {
        type: 'free',
        quotas: [],
        usage: user.data,
      },
      status: 'false',
      message: 'Người dùng không đăng ký gói dịch vụ',
    };
  }
}

function formatPrice(price: number) {
  let [wholeNumber, decimal] = price.toString().split('.');
  wholeNumber = wholeNumber.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (decimal) {
    decimal = decimal.slice(0, 2).padEnd(2, '0');
    return wholeNumber + '.' + decimal;
  } else {
    return wholeNumber;
  }
}

import { Controller, Get } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { NotificationsService } from './notifications.service';

@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @MessagePattern('createNotification')
  sendToDevice(@Payload() payload: any) {
    const { data, token } = payload;
    this.notificationsService
      .send(data, token)
      .then((response) => {
        //
      })
      .catch((error) => {});
  }

  @Get('/:id')
  findOne(@Payload() user_id: string) {
    return this.notificationsService.findByUser(user_id);
  }
}

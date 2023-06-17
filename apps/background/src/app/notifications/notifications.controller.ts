import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { NotificationsService } from './notifications.service';

@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @MessagePattern('createNotification')
  async sendToDeviceMS(@Payload() payload) {
    const { data, token } = payload;
    try {
      await this.notificationsService.send(data, token);
    } catch (error) {
      console.log(error);
    }
  }

  @MessagePattern('createNotification')
  async sendToMultiDevice(@Payload() payload) {
    const { data, tokens } = payload;
    try {
      await this.notificationsService.sendMulticast(data, tokens);
    } catch (error) {
      console.log(error);
    }
  }
}

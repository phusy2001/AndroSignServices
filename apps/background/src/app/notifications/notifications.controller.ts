import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { NotificationsService } from './notifications.service';

@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @MessagePattern('send')
  async sendToDevice(@Payload() payload) {
    const { data, token } = payload;
    try {
      await this.notificationsService.send(data, token);
    } catch (error) {
      console.log(error);
    }
  }

  @MessagePattern('send_to_multicast')
  async sendToMultiDevice(@Payload() payload) {
    const { data, tokens } = payload;
    try {
      await this.notificationsService.sendMulticast(data, tokens);
    } catch (error) {
      console.log(error);
    }
  }
}

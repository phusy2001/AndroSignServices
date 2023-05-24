import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Notification } from './entities/notification.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>
  ) {}

  async create(createNotificationDto: CreateNotificationDto) {
    const notification = new this.notificationModel(createNotificationDto);
    await notification.save();
    return notification;
  }

  //Send messages to specific devices
  async send(data: any, registrationToken: string): Promise<any> {
    const message = {
      data: data,
      token: registrationToken,
    };

    return await admin.messaging().send(message);
  }

  //Send messages to specific devices
  async sendToTopic(data: any, topic: string) {
    const { title, body } = data;
    const message = {
      notification: {
        title: title,
        body: body,
      },
      topic: topic,
    };
    return await admin.messaging().send(message);
  }

  findByUser(id: string) {
    return `This action returns a #${id} notification by user`;
  }
}

import { Injectable } from '@nestjs/common';

import admin from '../../config/firebase';

@Injectable()
export class NotificationsService {
  send(data, token: string) {
    return admin.messaging().send({
      data: {
        title: data.title,
        body: data.body,
      },
      android: {
        priority: 'high',
      },
      token: token,
    });
  }

  sendMulticast(data, token: string[]) {
    return admin.messaging().sendEachForMulticast({
      data: {
        title: data.title,
        body: data.body,
      },
      android: {
        priority: 'high',
      },
      tokens: token,
    });
  }
}

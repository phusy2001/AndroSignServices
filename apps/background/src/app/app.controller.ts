import { Body, Controller, Get, Post } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('/users/:id/tokens')
  async saveFCMToken(@Body() payload: any) {
    const { token } = payload;
    //this.appService.createFCMToken(token);
  }

  @Post()
  async sendToDevice(@Body() payload: any) {
    const { token, data } = payload;
    // await admin
    //   .messaging()
    //   .sendToDevice(
    //     'dxr1Nk07TUy540vUi5OGD6:APA91bHVydqd1Kc-fKj8GXaDZGVze6LOGZpViefkflkP9eIMxj6LCZY71N_3lSWMzZ0mfe0z4G0RK2JNcZiuUWJVDH_mL-QqTuhBs0Y8EhxnPCpW9SljvF8EoP2bn5z2Suyrm21P4ZFo',
    //     {
    //       data: {
    //         title: 'Kí duyệt',
    //         body: 'Bạn có 1 văn bản cần kí',
    //         click_action: '',
    //         icon: '',
    //       },
    //     }
    //   )
    //   .then((res) => {
    //     console.log(res);
    //   });
    await admin
      .messaging()
      .sendToDevice(
        token,
        {
          data: data
        }
      )
      .then((res) => {
        console.log(res);
      });
  }

  @Post()
  async sendMulticast(@Body() payload: any) {
    const { tokens, data } = payload;
    // Fetch the tokens from an external datastore (e.g. database)
    //const tokens = await getTokensFromDatastore();

    // Send a message to devices with the registered tokens
    await admin.messaging().sendMulticast({
      tokens, // ['token_1', 'token_2', ...]
      data: data
    });
  }
}

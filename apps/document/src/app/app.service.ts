import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { defaultIfEmpty, lastValueFrom } from 'rxjs';

@Injectable()
export class AppService {
  constructor(
    @Inject('USER_SERVICE') private userService: ClientProxy,
    @Inject('BACKGROUND_SERVICE') private backgroundService: ClientProxy,
    @Inject('ESIGNATURE_SERVICE') private esignatureService: ClientProxy
  ) {}

  async getIdByUserEmail(email: string) {
    return await lastValueFrom(
      this.userService.send('get_user_by_email', email)
    );
  }

  async getUsersByIdArr(ids: string[]) {
    return await lastValueFrom(
      this.userService.send('get_users_from_list_uid', ids)
    );
  }

  async getUserFcmtoken(id: string) {
    return await lastValueFrom(this.userService.send('get_fcmtoken_user', id));
  }

  async sendUserNotification(fcmtokens: string[], title: string, body: string) {
    return await lastValueFrom(
      this.backgroundService
        .send('send_to_multicast', {
          data: {
            title,
            body,
          },
          tokens: fcmtokens,
        })
        .pipe(defaultIfEmpty([]))
    );
  }

  async signDocument(data: any) {
    return await lastValueFrom(
      this.esignatureService.send('sign_document_img', data)
    );
  }

  async encryptPassword(password: string) {
    return await lastValueFrom(
      this.esignatureService.send('encrypt_password_ca', password)
    );
  }

  async sendEmailNotification(
    email: string,
    subject: string,
    content: string,
    subjectContent: string
  ) {
    return await lastValueFrom(
      this.backgroundService.send('send_email', {
        email,
        subject,
        content,
        subjectContent,
      })
    );
  }

  async convertToPDF(buffer: any, fileName: string) {
    return await lastValueFrom(
      this.esignatureService.send('to_pdf', {
        content: buffer,
        name: fileName,
      })
    );
  }
}

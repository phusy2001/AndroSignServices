import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AppService {
  constructor(@Inject('USER_SERVICE') private userService: ClientProxy) {}

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
}

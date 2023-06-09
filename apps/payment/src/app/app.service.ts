import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: any) {}

  async getData() {
    const value = await this.redisClient.get('name');
    return { message: value };
  }
}

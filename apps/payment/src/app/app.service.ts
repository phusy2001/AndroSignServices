import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  constructor() {}

  async getData(value: string) {
    return { message: value };
  }
}

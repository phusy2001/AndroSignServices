import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import * as https from 'https';
@Injectable()
export class AppService {
  constructor(private readonly httpService: HttpService) {
    this.httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });
    this.certHost = 'localhost:4200/api/Cer/';
  }
  private certHost: string;
  private httpsAgent: https.Agent;

  getData(): { message: string } {
    return { message: 'Welcome to esignature!' };
  }

  test() {
    this.httpService
      .post(this.certHost, {
        httpsAgent: this.httpsAgent,
      })
      .subscribe((res) => {
        return res.data;
      });
  }

  createSelfCA(
    issued: string,
    password: string,
    fileName: string,
    expireAfter?: number
  ) {
    this.httpService
      .post(
        this.certHost + 'CreateSelfCA',
        [issued, password, fileName, expireAfter],
        {
          httpsAgent: this.httpsAgent,
        }
      )
      .subscribe((res) => {
        return res.data;
      });
  }
}

import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import * as https from 'https';
import { Observable } from 'rxjs';
@Injectable()
export class AppService {
  constructor(private readonly httpService: HttpService) {
    this.httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });
    this.certHost = 'https://localhost:7207/api/Cer/';
    this.signPDFMethod = '/CreateSelfCA';
    this.signPDFMethod = '/SignPDF';
  }
  private certHost: string;
  private createCAMethod: string;
  private signPDFMethod: string;
  private httpsAgent: https.Agent;

  getData(): { message: string } {
    return { message: 'Welcome to esignature!' };
  }

  test(): Observable<any> {
    return this.httpService.post(this.certHost, {
      httpsAgent: this.httpsAgent,
    });
  }

  createSelfCA(
    issued: string,
    password: string,
    fileName: string,
    expireAfter?: number
  ): Observable<any> {
    return this.httpService.request({
      url: this.createCAMethod,
      method: 'POST',
      baseURL: this.certHost,
      params: {
        issued: issued,
        password: password,
        fileName: fileName,
        expireAfter: expireAfter,
      },
    });
  }

  signPDF(
    pdfPath: string,
    pfxPath: string,
    password: string,
    imgPath: string,
    stepNo: string,
    xfdf: string
  ): Observable<any> {
    return this.httpService.request({
      url: this.signPDFMethod,
      method: 'POST',
      baseURL: this.certHost,
      params: {
        pdfPath: pdfPath,
        pfxPath: pfxPath,
        password: password,
        imgPath: imgPath,
        stepNo: stepNo,
        xfdf: xfdf,
      },
    });
  }
}

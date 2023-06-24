import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import * as https from 'https';
import * as CryptoJS from 'crypto-js';
import { Observable } from 'rxjs';
@Injectable()
export class AppService {
  constructor(private readonly httpService: HttpService) {
    this.httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });
    this.certHost = 'https://localhost:7207/api/Cer/';
    this.createCAMethod = '/CreateSelfCA';
    this.signPDFMethod = '/SignPDF';
  }
  private certHost: string;
  private createCAMethod: string;
  private signPDFMethod: string;
  private httpsAgent: https.Agent;

  getData(): { message: string } {
    return { message: 'Welcome to esignature!' };
  }

  private encrypt(plainText: string): string {
    let key = CryptoJS.enc.Utf8.parse('4512631236589784');
    let iv = CryptoJS.enc.Utf8.parse('4512631236589784');
    var encrypted = CryptoJS.AES.encrypt(
      CryptoJS.enc.Utf8.parse(plainText),
      key,
      {
        keySize: 128 / 8,
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    );
    return encrypted.toString();
  }
  test(): Observable<any> {
    let cipher = this.encrypt('nhbuu');
    console.log('cipher', cipher);

    return this.httpService.request({
      url: '',
      method: 'POST',
      baseURL: this.certHost,
      params: {
        cipher: cipher,
      },
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

  signPDF(data: any): Observable<any> {
    return this.httpService.request({
      url: this.signPDFMethod,
      method: 'POST',
      baseURL: this.certHost,
      data: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import * as https from 'https';
import * as CryptoJS from 'crypto-js';
import { Observable, lastValueFrom } from 'rxjs';
import { Multer } from 'multer';

@Injectable()
export class AppService {
  constructor(private readonly httpService: HttpService) {
    this.httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });
    // this.certHost = process.env.ESIGNATURE_SERVICE_API;
    this.certHost = 'https://localhost:7207/api/Cer';
    this.createCAMethod = '/CreateSelfCA';
    this.signPDFImgMethod = '/SignPDFWithImg';
    this.signPDFCAMethod = '/SignPDFWithCA';
    this.convertMethod = '/ToPdf';
  }
  private certHost: string;
  private createCAMethod: string;
  private signPDFImgMethod: string;
  private signPDFCAMethod: string;
  private convertMethod: string;
  private httpsAgent: https.Agent;

  encrypt(plainText: string): string {
    const key = CryptoJS.enc.Utf8.parse('4512631236589784');
    const iv = CryptoJS.enc.Utf8.parse('4512631236589784');
    const encrypted = CryptoJS.AES.encrypt(
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

  async createSelfCA(
    issued: string,
    password: string,
    fileName: string,
    expireAfter?: number,
    isUpdate?: boolean,
    newPass?: string
  ): Promise<any> {
    return await lastValueFrom(
      this.httpService.request({
        url: this.createCAMethod,
        method: 'POST',
        baseURL: this.certHost,
        params: {
          issued: issued,
          password: password,
          fileName: fileName,
          expireAfter: expireAfter,
          isUpdate: isUpdate,
          newPass: newPass,
        },
      })
    );
  }

  async signPDF(data: any, type: string): Promise<any> {
    let method = '';
    if (type === 'ca') {
      method = this.signPDFCAMethod;
    } else if (type == 'img') {
      method = this.signPDFImgMethod;
    }
    return await lastValueFrom(
      this.httpService.request({
        url: method,
        method: 'POST',
        baseURL: this.certHost,
        data: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      })
    );
  }

  async convertFile(file: Express.Multer.File): Promise<any> {
    return await lastValueFrom(
      this.httpService.request({
        url: this.convertMethod,
        method: 'POST',
        baseURL: this.certHost,
        data: {
          fileName: file.originalname,
          content: Buffer.from(file.buffer).toString('base64'),
        },
        headers: {
          'Content-Type': 'multipart/form-data;',
        },
      })
    );
  }
}

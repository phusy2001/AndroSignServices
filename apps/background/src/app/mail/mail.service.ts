import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class MailService {
  constructor(
    private readonly client: OAuth2Client,
    private configService: ConfigService
  ) {
    this.client = new OAuth2Client(
      this.configService.get<string>('GOOGLE_MAILER_CLIENT_ID'),
      this.configService.get<string>('GOOGLE_MAILER_CLIENT_SECRET')
    );

    this.client.setCredentials({
      refresh_token: this.configService.get<string>(
        'GOOGLE_MAILER_REFRESH_TOKEN'
      ),
    });
  }
}

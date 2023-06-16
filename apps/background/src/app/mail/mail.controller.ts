import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { MessagePattern } from '@nestjs/microservices';

@Controller('mail')
export class MailController {
  constructor(private readonly mailerService: MailerService) {}

  @Post('send')
  async sendEmail(
    @Body() emailData: { email: string; subject: string; content: string }
  ) {
    try {
      const { email, subject, content } = emailData;
      if (!email || !subject || !content) {
        throw new HttpException(
          'Please provide email, subject, and content!',
          HttpStatus.NOT_FOUND
        );
      }

      await this.mailerService.sendMail({
        to: email,
        subject: subject,
        html: content,
      });

      return { statusCode: 200, message: 'Email sent successfully.' };
    } catch (error) {
      throw new HttpException(
        'Failed to send email.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @MessagePattern('send_mail')
  async sendEmailMS(emailData: {
    email: string;
    subject: string;
    content: string;
  }) {
    try {
      const { email, subject, content } = emailData;
      if (!email || !subject || !content) {
        throw new HttpException(
          'Please provide email, subject, and content!',
          HttpStatus.NOT_FOUND
        );
      }

      await this.mailerService.sendMail({
        to: email,
        subject: subject,
        html: content,
      });

      return { statusCode: 200, message: 'Email sent successfully.' };
    } catch (error) {
      throw new HttpException(
        'Failed to send email.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}

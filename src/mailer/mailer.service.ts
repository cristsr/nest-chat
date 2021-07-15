import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { SentMessageInfo } from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { CONFIG } from 'config/config-keys';

@Injectable()
export class MailerService {
  private logger = new Logger(MailerService.name);
  private readonly transporter = nodemailer.createTransport({
    host: 'smtp.googlemail.com',
    secure: false, // true for 465, false for other ports
    auth: {
      user: this.config.get(CONFIG.GMAIL), // generated ethereal user
      pass: this.config.get(CONFIG.GMAIL_PASSWORD), // generated ethereal password
    },
  });

  constructor(private config: ConfigService) {}

  sendMail(config): Promise<SentMessageInfo> {
    return this.transporter.sendMail(config).catch((e) => {
      this.logger.error('Mail not sent: ' + e.message);
      throw new InternalServerErrorException(e.message);
    });
  }
}

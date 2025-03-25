import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) { }

  getCode() {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    return code;
  }

  async sendCodeConfirmation(email: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Confirma tu correo en Nuestra App',
      template: './confirmation', // se añade automáticamente la extensión (.hbs)
      context: {
        logoUrl: 'https://eventuz.com/assets/images/logo1.svg',
        verificationCode: this.getCode(),
        year: new Date().getFullYear(),
      },
    });
  }
}

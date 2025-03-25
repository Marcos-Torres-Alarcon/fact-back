import { Controller, Get, Post, Body } from '@nestjs/common';
import { EmailService } from './email.service';
import { SendCodeDto } from './dto/send-code.dto';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) { }

  @Post('send-code')
  sendCodeConfirmation(@Body() sendCodeDto: SendCodeDto) {
    return this.emailService.sendCodeConfirmation(sendCodeDto.email);
  }
}

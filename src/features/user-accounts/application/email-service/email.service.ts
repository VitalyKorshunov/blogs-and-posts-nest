import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { SETTINGS } from '../../../../settings';

class SendEmailDTO {
  email: string;
  subject: string;
  templateName: string;
  context: object;
}

@Injectable()
export class EmailService {
  constructor(private mailerService: MailerService) {}

  registration(email: string, confirmationCode: string): void {
    const dto: SendEmailDTO = {
      email,
      subject: 'Finish creating your account',
      templateName: 'registration',
      context: {
        code: confirmationCode,
      },
    };
    this.sendEmail(dto);
  }

  registrationEmailResending(email: string, confirmationCode: string): void {
    const dto: SendEmailDTO = {
      email,
      subject: 'Finish creating your account',
      templateName: 'registration',
      context: {
        code: confirmationCode,
      },
    };
    this.sendEmail(dto);
  }

  passwordRecovery(email: string, recoveryCode: string): void {
    const dto: SendEmailDTO = {
      email,
      subject: 'Recovery password',
      templateName: 'recovery-password',
      context: {
        recoveryCode,
      },
    };
    this.sendEmail(dto);
  }

  private sendEmail(dto: SendEmailDTO): void {
    this.mailerService
      .sendMail({
        from: `SomeSiteName ${SETTINGS.MAILER.USER}`,
        to: dto.email,
        subject: dto.subject,
        template: dto.templateName,
        context: dto.context,
      })
      .then((success) => {
        console.log(success);
      })
      .catch((error) => {
        console.log(error);
      });
  }
}

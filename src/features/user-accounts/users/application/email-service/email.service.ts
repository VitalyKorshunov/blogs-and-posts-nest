import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { UserAccountsConfig } from '../../../user-accounts.config';

interface SendEmailDTO {
  email: string;
  subject: string;
  templateName: string;
  context: object;
}

enum TemplateName {
  Registration = 'registration',
  RecoveryPassword = 'recovery-password',
}

@Injectable()
export class EmailService {
  constructor(
    private mailerService: MailerService,
    private userAccountsConfig: UserAccountsConfig,
  ) {}

  registration(email: string, confirmationCode: string): void {
    const dto: SendEmailDTO = {
      email,
      subject: 'Finish creating your account',
      templateName: TemplateName.Registration,
      context: {
        confirmationCode,
      },
    };
    this.sendEmail(dto);
  }

  registrationEmailResending(email: string, confirmationCode: string): void {
    const dto: SendEmailDTO = {
      email,
      subject: 'Finish creating your account',
      templateName: TemplateName.Registration,
      context: {
        confirmationCode,
      },
    };
    this.sendEmail(dto);
  }

  passwordRecovery(email: string, recoveryCode: string): void {
    const dto: SendEmailDTO = {
      email,
      subject: 'Recovery password',
      templateName: TemplateName.RecoveryPassword,
      context: {
        recoveryCode,
      },
    };
    this.sendEmail(dto);
  }

  private sendEmail(dto: SendEmailDTO): void {
    this.mailerService
      .sendMail({
        from: `SomeSiteName ${this.userAccountsConfig.mailUser}`,
        to: dto.email,
        subject: dto.subject,
        template: dto.templateName,
        context: dto.context,
      })
      .then((success) => {
        // console.log(success);
      })
      .catch((error) => {
        // console.log(error);
      });
  }
}

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { configValidationUtility } from '../../../core/config-validation.utility';
import { IsNotEmpty, IsNumber } from 'class-validator';

@Injectable()
export class UserAccountsConfig {
  @IsNotEmpty({
    message: 'Set Env variable MAIL_HOST, example: smtp.mail.ru',
  })
  mailHost: string = this.configService.get<string>('MAIL_HOST');

  @IsNumber(
    {},
    {
      message: 'Set Env variable MAIL_PORT, example: 465',
    },
  )
  mailPort: number = Number(this.configService.get<string>('MAIL_PORT'));

  @IsNotEmpty({
    message: 'Set Env variable MAIL_USER, example: example@mail.ru',
  })
  mailUser: string = this.configService.get<string>('MAIL_USER');

  @IsNotEmpty({
    message: 'Set Env variable MAIL_PASS, example: passwordForMail',
  })
  mailPass: string = this.configService.get<string>('MAIL_PASS');

  @IsNotEmpty({
    message:
      'Set Env variable PATH_TO_MAIL_TEMPLATES, example: /users/application/email-service/templates',
  })
  pathToMailTemplates: string = this.configService.get<string>(
    'PATH_TO_MAIL_TEMPLATES',
  );

  constructor(private configService: ConfigService<any, true>) {
    console.log('UserAccountsConfig created');
    configValidationUtility.validateConfig(this);
  }
}

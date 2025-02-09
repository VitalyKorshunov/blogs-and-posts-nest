import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { configValidationUtility } from '../../core/config-validation.utility';
import { IsNotEmpty, IsNumber, NotEquals } from 'class-validator';

@Injectable()
export class UserAccountsConfig {
  @IsNotEmpty({
    message: 'Set Env variable MAIL_HOST, example: smtp.mail.ru',
  })
  mailHost: string = this.configService.get<string>('MAIL_HOST');

  @NotEquals(0, {
    message: 'Env variable MAIL_PORT must be > 0, example: 465',
  })
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

  @NotEquals(0, {
    message:
      'Env variable EMAIL_CONFIRMATION_CODE_EXPIRES_IN_HOURS must be > 0, example: 5',
  })
  @IsNumber(
    {},
    {
      message:
        'Set Env variable EMAIL_CONFIRMATION_CODE_EXPIRES_IN_HOURS, example: 5',
    },
  )
  emailConfirmationCodeExpiresInHours: number = Number(
    this.configService.get<string>('EMAIL_CONFIRMATION_CODE_EXPIRES_IN_HOURS'),
  );

  @NotEquals(0, {
    message:
      'Env variable PASSWORD_RECOVERY_CODE_EXPIRES_IN_HOURS must be > 0, example: 2',
  })
  @IsNumber(
    {},
    {
      message:
        'Set Env variable PASSWORD_RECOVERY_CODE_EXPIRES_IN_HOURS, example: 2',
    },
  )
  passwordRecoveryCodeExpiresInHours: number = Number(
    this.configService.get<string>('PASSWORD_RECOVERY_CODE_EXPIRES_IN_HOURS'),
  );

  @IsNotEmpty({
    message:
      'Set Env variable ACCESS_TOKEN_SECRET, example: SomeVeryHardSecret!#$',
  })
  accessTokenSecret: string = this.configService.get<string>(
    'ACCESS_TOKEN_SECRET',
  );

  @IsNotEmpty({
    message:
      'Set Env variable ACCESS_TOKEN_LIFETIME, example: 30000 (ms), 30s, 10m, 1h, 1d',
  })
  accessTokenLifetime: string = this.configService.get<string>(
    'ACCESS_TOKEN_LIFETIME',
  );

  @IsNotEmpty({
    message:
      'Set Env variable REFRESH_TOKEN_SECRET, example: SomeVeryHardSecret!#$',
  })
  refreshTokenSecret: string = this.configService.get<string>(
    'REFRESH_TOKEN_SECRET',
  );

  @IsNotEmpty({
    message:
      'Set Env variable REFRESH_TOKEN_LIFETIME, example: 30000 (ms), 30s, 10m, 1h, 1d',
  })
  refreshTokenLifetime: string = this.configService.get<string>(
    'REFRESH_TOKEN_LIFETIME',
  );

  constructor(private configService: ConfigService<any, true>) {
    console.log('UserAccountsConfig created');
    configValidationUtility.validateConfig(this);
  }
}

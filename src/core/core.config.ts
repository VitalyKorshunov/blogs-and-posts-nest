import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  NotEquals,
} from 'class-validator';
import { ConfigService } from '@nestjs/config';
import { configValidationUtility } from './config-validation.utility';
import { Injectable } from '@nestjs/common';

export enum Environment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TESTING = 'testing',
}

@Injectable()
export class CoreConfig {
  @NotEquals(0, {
    message: 'Env variable PORT must be > 0, example: 5000',
  })
  @IsNumber(
    {},
    {
      message: 'Set Env variable PORT, example: 5000',
    },
  )
  port: number = Number(this.configService.get('PORT'));

  @IsNotEmpty({
    message:
      'Set Env variable MONGO_URI, example: mongodb://localhost:27017/my-app-local-db',
  })
  mongoURI: string = this.configService.get('MONGO_URI');

  @IsEnum(Environment, {
    message:
      'Set correct NODE_ENV value, available values: ' +
      configValidationUtility.getEnumValue(Environment).join(', '),
  })
  env: string = this.configService.get('NODE_ENV');

  @IsBoolean({
    message:
      'Set Env variable IS_SWAGGER_ENABLED to enable/disable Swagger, example: true, available values: true, false, 1, 0',
  })
  isSwaggerEnabled: boolean = configValidationUtility.convertToBoolean(
    this.configService.get('IS_SWAGGER_ENABLED'),
  ) as boolean;

  @IsBoolean({
    message:
      'Set Env variable INCLUDE_TESTING_MODULE to enable/disable Dangerous for production TestingModule, example: true, available values: true, false, 1, 0',
  })
  includeTestingModule: boolean = configValidationUtility.convertToBoolean(
    this.configService.get('INCLUDE_TESTING_MODULE'),
  ) as boolean;

  @NotEquals(0, {
    message: 'Env variable LIMIT_REQUEST_IN_TTL must be > 0, example: 5',
  })
  @IsNumber(
    {},
    {
      message: 'Set Env variable LIMIT_REQUEST_IN_TTL, example: 5',
    },
  )
  limitRequestInTtl: number = Number(
    this.configService.get<string>('LIMIT_REQUEST_IN_TTL'),
  );

  @NotEquals(0, {
    message: 'Env variable TTL_IN_SECONDS must be > 0, example: 10',
  })
  @IsNumber(
    {},
    {
      message: 'Set Env variable TTL_IN_SECONDS, example: 10',
    },
  )
  ttlInSeconds: number = Number(
    this.configService.get<string>('TTL_IN_SECONDS'),
  );

  @IsNotEmpty({ message: 'Set Env variable PG_HOST, example: localhost' })
  pgHost: string = this.configService.get<string>('PG_HOST');

  @NotEquals(0, {
    message: 'Env variable PG_PORT must be > 0, example: 5432',
  })
  @IsNumber(
    {},
    {
      message: 'Set Env variable PG_PORT, example: 5432',
    },
  )
  pgPort: number = Number(this.configService.get('PG_PORT'));

  @IsNotEmpty({ message: 'Set Env variable PG_USERNAME, example: localhost' })
  pgUsername: string = this.configService.get<string>('PG_USERNAME');

  @IsNotEmpty({ message: 'Set Env variable PG_PASSWORD, example: localhost' })
  pgPassword: string = this.configService.get<string>('PG_PASSWORD');

  @IsNotEmpty({ message: 'Set Env variable PG_DATABASE, example: localhost' })
  pgDatabase: string = this.configService.get<string>('PG_DATABASE');

  @IsNotEmpty({
    message:
      'Set Env variable PG_SSL_ENABLE, example: true, available values: true, false, 1, 0 0',
  })
  pgSslEnable: boolean = configValidationUtility.convertToBoolean(
    this.configService.get('PG_SSL_ENABLE'),
  ) as boolean;

  constructor(private configService: ConfigService<any, true>) {
    console.log('CoreConfig created');
    configValidationUtility.validateConfig(this);
  }
}

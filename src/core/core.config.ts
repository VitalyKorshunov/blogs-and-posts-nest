import { IsBoolean, IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { ConfigService } from '@nestjs/config';
import { configValidationUtility } from './config-validation.utility';

export enum Environment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TESTING = 'testing',
}

export class CoreConfig {
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

  constructor(private configService: ConfigService<any, true>) {
    console.log('CoreConfig created');
    configValidationUtility.validateConfig(this);
  }
}

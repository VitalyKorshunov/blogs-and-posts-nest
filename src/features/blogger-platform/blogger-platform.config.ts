import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { configValidationUtility } from '../../core/config-validation.utility';
import { IsNumber, NotEquals } from 'class-validator';

@Injectable()
export class BloggerPlatformConfig {
  @NotEquals(0, {
    message:
      'Env variable LAST_NEWEST_LIKES_COUNT_FOR_POST must be > 0, example: 3',
  })
  @IsNumber(
    {},
    {
      message: 'Set Env variable LAST_NEWEST_LIKES_COUNT_FOR_POST, example: 3',
    },
  )
  lastNewestLikesCountForPost: number = Number(
    this.configService.get<string>('LAST_NEWEST_LIKES_COUNT_FOR_POST'),
  );

  constructor(private configService: ConfigService<any, true>) {
    console.log('BloggerPlatformConfig created');
    configValidationUtility.validateConfig(this);
  }
}

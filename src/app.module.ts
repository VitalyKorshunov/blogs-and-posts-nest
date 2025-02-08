import { configModule } from './dynamic-config-module';
import { DynamicModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAccountsModule } from './features/user-accounts/user-accounts.module';
import { TestingModule } from './features/testing/testing.module';
import { BloggerPlatformModule } from './features/blogger-platform/blogger-platform.module';
import { CqrsModule } from '@nestjs/cqrs';
import { CoreModule } from './core/core.module';
import { CoreConfig } from './core/core.config';
import { seconds, ThrottlerModule } from '@nestjs/throttler';
import { SETTINGS } from './settings';

@Module({
  imports: [
    CoreModule,
    CqrsModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [CoreModule],
      useFactory: (coreConfig: CoreConfig) => {
        return {
          uri: coreConfig.mongoURI,
        };
      },
      inject: [CoreConfig],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: seconds(SETTINGS.THROTTLER.TTL_IN_SECONDS),
        limit: SETTINGS.THROTTLER.LIMIT_REQUEST_IN_TTL,
      },
    ]),
    configModule,
    UserAccountsModule,
    BloggerPlatformModule,
  ],
})
export class AppModule {
  static async forRoot(coreConfig: CoreConfig): Promise<DynamicModule> {
    const additionalModules: any[] = [];
    if (coreConfig.includeTestingModule) {
      additionalModules.push(TestingModule);
    }

    return {
      module: AppModule,
      imports: additionalModules,
    };
  }
}

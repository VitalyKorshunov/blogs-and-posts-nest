import { configModule } from './dynamic-config-module';
import { DynamicModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAccountsModule } from './features/user-accounts/user-accounts.module';
import { TestingModule } from './features/testing/testing.module';
import { BloggerPlatformModule } from './features/blogger-platform/blogger-platform.module';
import { CqrsModule } from '@nestjs/cqrs';
import { CoreModule } from './core/core.module';
import { CoreConfig } from './core/core.config';

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

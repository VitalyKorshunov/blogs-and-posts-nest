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
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    CoreModule,
    CqrsModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [CoreModule],
      inject: [CoreConfig],
      useFactory: (coreConfig: CoreConfig) => {
        return {
          type: 'postgres',
          host: coreConfig.pgHost,
          port: coreConfig.pgPort,
          username: coreConfig.pgUsername,
          password: coreConfig.pgPassword,
          database: coreConfig.pgDatabase,
          ssl: coreConfig.pgSslEnable,
          autoLoadEntities: false,
          synchronize: false,
          logging: true,
        };
      },
    }),
    MongooseModule.forRootAsync({
      imports: [CoreModule],
      inject: [CoreConfig],
      useFactory: (coreConfig: CoreConfig) => {
        return {
          uri: coreConfig.mongoURI,
        };
      },
    }),
    ThrottlerModule.forRootAsync({
      imports: [CoreModule],
      inject: [CoreConfig],
      useFactory: (coreConfig: CoreConfig) => {
        return [
          {
            ttl: seconds(coreConfig.ttlInSeconds),
            limit: coreConfig.limitRequestInTtl,
          },
        ];
      },
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

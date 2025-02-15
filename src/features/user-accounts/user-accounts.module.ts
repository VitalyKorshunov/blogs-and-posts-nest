import { Module } from '@nestjs/common';
import { UsersController } from './users/api/users.controller';
import { UsersService } from './users/application/users.service';
import { UsersRepository } from './users/infrastructure/users.repository';
import { UsersQueryRepository } from './users/infrastructure/query/users.query-repository';
import { CryptoService } from './users/application/crypto.service';
import { LocalStrategy } from './users/guards/local/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { AuthControllers } from './users/api/auth.controller';
import { AuthQueryRepository } from './users/infrastructure/query/auth.query-repository';
import { AuthService } from './users/application/auth.service';
import { AccessTokenStrategy } from './users/guards/bearer/access-token.strategy';
import { JwtService } from '@nestjs/jwt';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailService } from './users/application/email-service/email.service';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { BasicAuthStrategy } from './users/guards/basic/basic.strategy';
import { CreateUserByAdminUseCase } from './users/application/use-cases/create-user-by-admin-use-case';
import { ChangeUserPasswordUseCase } from './users/application/use-cases/change-user-password.use-case';
import { ConfirmUserEmailUseCase } from './users/application/use-cases/confirm-user-email.use-case';
import { DeleteUserUseCase } from './users/application/use-cases/delete-user.use-case';
import { LoginUserUseCase } from './users/application/use-cases/login-user.use-case';
import { RegistrationUserUseCase } from './users/application/use-cases/registration-user.use-case';
import { ResendUserConfirmationEmailUseCase } from './users/application/use-cases/resend-user-confirmation-email.use-case';
import { SendUserRecoveryPasswordUseCase } from './users/application/use-cases/send-user-recovery-password.use-case';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from './users/constants/auth-tokens.inject-constants';
import { RefreshTokenStrategy } from './users/guards/cookie/refresh-token.strategy';
import { SecurityController } from './security/api/security.controller';
import { SecurityRepository } from './security/infrastructure/security.repository';
import { SecurityQueryRepository } from './security/infrastructure/security.query-repository';
import { CreateSessionUseCase } from './security/application/use-cases/create-session.use-case';
import { UpdateUserSessionUseCase } from './security/application/use-cases/update-user-session.use-case';
import { UpdateTokensUseCase } from './users/application/use-cases/update-tokens.use-case';
import { DeleteAllUserSessionsExpectCurrentUseCase } from './security/application/use-cases/delete-all-user-sessions-expect-current.use-case';
import { DeleteUserSessionByDeviceIdUseCase } from './security/application/use-cases/delete-user-session-by-device-id.use-case';
import { UserAccountsConfig } from './user-accounts.config';

const services = [UsersService, AuthService];

const strategies = [
  LocalStrategy,
  AccessTokenStrategy,
  RefreshTokenStrategy,
  BasicAuthStrategy,
];

const adapters = [CryptoService, EmailService];

const userUseCases = [
  ChangeUserPasswordUseCase,
  ConfirmUserEmailUseCase,
  CreateUserByAdminUseCase,
  DeleteUserUseCase,
  LoginUserUseCase,
  RegistrationUserUseCase,
  ResendUserConfirmationEmailUseCase,
  SendUserRecoveryPasswordUseCase,
  UpdateTokensUseCase,
];

const securityUseCases = [
  CreateSessionUseCase,
  DeleteAllUserSessionsExpectCurrentUseCase,
  DeleteUserSessionByDeviceIdUseCase,
  UpdateUserSessionUseCase,
];

const repositories = [
  UsersRepository,
  UsersQueryRepository,
  AuthQueryRepository,
  SecurityRepository,
  SecurityQueryRepository,
];

//TODO: CHECK MailerModule and UserAccountsConfig
@Module({
  imports: [
    PassportModule,
    //TODO: Перенести в отдельный EmailModule
    MailerModule.forRootAsync({
      imports: [UserAccountsModule],
      inject: [UserAccountsConfig],
      useFactory: (userAccountsConfig: UserAccountsConfig) => ({
        transport: {
          host: userAccountsConfig.mailHost,
          port: userAccountsConfig.mailPort,
          secure: true,
          auth: {
            user: userAccountsConfig.mailUser,
            pass: userAccountsConfig.mailPass,
          },
        },
        defaults: {
          from: '"nest-modules" <modules@nestjs.com>',
        },
        template: {
          dir: __dirname + userAccountsConfig.pathToMailTemplates,
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  controllers: [UsersController, AuthControllers, SecurityController],
  providers: [
    UserAccountsConfig,
    ...services,
    ...strategies,
    ...adapters,
    ...userUseCases,
    ...securityUseCases,
    ...repositories,
    {
      provide: ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (userAccountsConfig: UserAccountsConfig): JwtService => {
        return new JwtService({
          secret: userAccountsConfig.accessTokenSecret,
          signOptions: {
            expiresIn: userAccountsConfig.accessTokenLifetime,
            noTimestamp: true,
          },
        });
      },
      inject: [UserAccountsConfig],
    },
    {
      provide: REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (userAccountsConfig: UserAccountsConfig): JwtService => {
        return new JwtService({
          secret: userAccountsConfig.refreshTokenSecret,
          signOptions: {
            expiresIn: userAccountsConfig.refreshTokenLifetime,
            noTimestamp: true,
          },
        });
      },
      inject: [UserAccountsConfig],
    },
  ],
  exports: [
    UsersRepository,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    UserAccountsConfig,
  ],
})
export class UserAccountsModule {}

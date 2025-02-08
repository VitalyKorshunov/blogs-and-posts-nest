import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './users/domain/user.entity';
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
import { SETTINGS } from '../../settings';
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
import { Security, SecuritySchema } from './security/domain/security.entity';
import { SecurityController } from './security/api/security.controller';
import { SecurityRepository } from './security/infrastructure/security.repository';
import { SecurityQueryRepository } from './security/infrastructure/security.query-repository';
import { CreateSessionUseCase } from './security/application/use-cases/create-session.use-case';
import { UpdateUserSessionUseCase } from './security/application/use-cases/update-user-session.use-case';
import { UpdateTokensUseCase } from './users/application/use-cases/update-tokens.use-case';
import { DeleteAllUserSessionsExpectCurrentUseCase } from './security/application/use-cases/delete-all-user-sessions-expect-current.use-case';
import { DeleteUserSessionByDeviceIdUseCase } from './security/application/use-cases/delete-user-session-by-device-id.use-case';

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

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Security.name, schema: SecuritySchema },
    ]),
    PassportModule,
    MailerModule.forRoot({
      transport: {
        host: SETTINGS.MAILER.HOST,
        port: SETTINGS.MAILER.PORT,
        secure: true,
        auth: {
          user: SETTINGS.MAILER.USER,
          pass: SETTINGS.MAILER.PASS,
        },
      },
      defaults: {
        from: '"nest-modules" <modules@nestjs.com>',
      },
      template: {
        dir: __dirname + '/users/application/email-service/templates',
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  controllers: [UsersController, AuthControllers, SecurityController],
  providers: [
    ...services,
    ...strategies,
    ...adapters,
    ...userUseCases,
    ...securityUseCases,
    ...repositories,
    {
      provide: ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (): JwtService => {
        return new JwtService({
          secret: SETTINGS.TOKENS.ACCESS_TOKEN.SECRET_KEY,
          signOptions: {
            expiresIn: SETTINGS.TOKENS.ACCESS_TOKEN.LIFETIME_IN_MS,
            noTimestamp: true,
          },
        });
      },
      inject: [],
    },
    {
      provide: REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (): JwtService => {
        return new JwtService({
          secret: SETTINGS.TOKENS.REFRESH_TOKEN.SECRET_KEY,
          signOptions: {
            expiresIn: SETTINGS.TOKENS.REFRESH_TOKEN.LIFETIME_IN_MS,
            noTimestamp: true,
          },
        });
      },
      inject: [],
    },
  ],
  exports: [UsersRepository, AccessTokenStrategy, RefreshTokenStrategy],
})
export class UserAccountsModule {}

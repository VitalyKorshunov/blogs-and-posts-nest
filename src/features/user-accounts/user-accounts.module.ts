import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './domain/user.entity';
import { UsersController } from './api/users.controller';
import { UsersService } from './application/users.service';
import { UsersRepository } from './infrastructure/users.repository';
import { UsersQueryRepository } from './infrastructure/query/users.query-repository';
import { CryptoService } from './application/crypto.service';
import { LocalStrategy } from './guards/local/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { AuthControllers } from './api/auth.controller';
import { AuthQueryRepository } from './infrastructure/query/auth.query-repository';
import { AuthService } from './application/auth.service';
import { JwtStrategy } from './guards/bearer/jwt.strategy';
import { JwtService } from '@nestjs/jwt';
import { MailerModule } from '@nestjs-modules/mailer';
import { SETTINGS } from '../../settings';
import { EmailService } from './application/email-service/email.service';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { BasicAuthStrategy } from './guards/basic/basic.strategy';
import { CreateUserByAdminUseCase } from './application/use-cases/create-user-by-admin-use-case';
import { ChangeUserPasswordUseCase } from './application/use-cases/change-user-password.use-case';
import { ConfirmUserEmailUseCase } from './application/use-cases/confirm-user-email.use-case';
import { DeleteUserUseCase } from './application/use-cases/delete-user.use-case';
import { LoginUserUseCase } from './application/use-cases/login-user.use-case';
import { RegistrationUserUseCase } from './application/use-cases/registration-user.use-case';
import { ResendUserConfirmationEmailUseCase } from './application/use-cases/resend-user-confirmation-email.use-case';
import { SendUserRecoveryPasswordUseCase } from './application/use-cases/send-user-recovery-password.use-case';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from './constants/auth-tokens.inject-constants';

const services = [UsersService, AuthService];

const strategies = [LocalStrategy, JwtStrategy, BasicAuthStrategy];

const adapters = [CryptoService, EmailService];

const useCases = [
  ChangeUserPasswordUseCase,
  ConfirmUserEmailUseCase,
  CreateUserByAdminUseCase,
  DeleteUserUseCase,
  LoginUserUseCase,
  RegistrationUserUseCase,
  ResendUserConfirmationEmailUseCase,
  SendUserRecoveryPasswordUseCase,
];

const repositories = [
  UsersRepository,
  UsersQueryRepository,
  AuthQueryRepository,
];

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    PassportModule,
    // JwtModule.register({
    //   global: true,
    //   secret: JWT_SECRET,
    //   signOptions: {
    //     expiresIn: '5m',
    //   },
    // }),
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
        dir: __dirname + '/application/email-service/templates',
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  controllers: [UsersController, AuthControllers],
  providers: [
    ...services,
    ...strategies,
    ...adapters,
    ...useCases,
    ...repositories,
    {
      provide: ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (): JwtService => {
        return new JwtService({
          secret: SETTINGS.TOKENS.ACCESS_TOKEN.SECRET_KEY,
          signOptions: {
            expiresIn: SETTINGS.TOKENS.ACCESS_TOKEN.LIFETIME,
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
            expiresIn: SETTINGS.TOKENS.REFRESH_TOKEN.LIFETIME,
          },
        });
      },
      inject: [],
    },
  ],
  exports: [UsersRepository, JwtStrategy],
})
export class UserAccountsModule {}

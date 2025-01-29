import { UsersRepository } from '../infrastructure/users.repository';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { UserId } from '../dto/user.dto';
import { LoginSuccessViewDTO } from '../api/view-dto/auth.view-dto';
import { JwtService } from '@nestjs/jwt';
import { UserContextDto } from '../guards/dto/user-context.dto';
import {
  ConfirmationCodeInputDTO,
  CreateUserInputDTO,
  EmailResendingInputDTO,
  NewPasswordInputDTO,
  PasswordRecoveryInputDTO,
} from '../api/input-dto/users.input-dto';
import { User, UserDocument, UserModelType } from '../domain/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { EmailService } from './email-service/email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private UserModel: UserModelType,
    // private authRepository: AuthRepository,
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  // private async findUserByLoginOrEmail(loginOrEmail: string): Promise<HydratedUserType | null> {
  //   const field = loginOrEmail.includes('@') ? 'email' : 'login'
  //
  //   return this.usersRepository.findUserByFieldAndValue(field, loginOrEmail)
  // }
  //

  private async validateLogin(login: string): Promise<void> {
    if (login.includes('@')) throw new Error('Incorrect login');

    const isLoginExist: boolean =
      await this.usersRepository.isUserFoundByEmailOrLogin(login);

    if (isLoginExist) {
      throw new BadRequestException([
        {
          field: 'login',
          message: 'login should be unique',
        },
      ]);
    }
  }

  private async validateEmail(email: string): Promise<void> {
    if (!email.includes('@')) throw new Error('Incorrect email');

    const isEmailExist: boolean =
      await this.usersRepository.isUserFoundByEmailOrLogin(email);

    if (isEmailExist) {
      throw new BadRequestException([
        {
          field: 'email',
          message: 'email should be unique',
        },
      ]);
    }
  }

  //
  // private async createAccessAndRefreshTokens(userId: UserId, deviceId: DeviceId): Promise<AuthTokensType | null> {
  //   const newAccessToken: string | null = await jwtService.createAccessToken(userId)
  //   const newRefreshToken: string | null = await jwtService.createRefreshToken(userId, deviceId)
  //
  //   if (!newAccessToken || !newRefreshToken) {
  //     return null
  //   }
  //
  //   return {
  //     accessToken: newAccessToken,
  //     refreshToken: newRefreshToken
  //   }
  // }
  //
  async loginUser(userId: UserId): Promise<LoginSuccessViewDTO> {
    const accessToken: string = this.jwtService.sign({
      userId,
    } as UserContextDto);

    return { accessToken: accessToken };
  }

  //
  // async logoutUser(refreshToken: string): Promise<ResultType<null>> {
  //   const refreshTokenPayload: VerifyRefreshTokenViewModel | null = await jwtService.verifyRefreshToken(refreshToken)
  //   if (!refreshTokenPayload) {
  //     return result.tokenError('error verify refresh token')
  //   }
  //
  //   const {deviceId, iat} = refreshTokenPayload
  //   const lastActiveDate: Date = new Date(iat)
  //
  //   const isSecuritySessionDataDeleted: boolean = await this.authRepository.deleteSecuritySessionData(deviceId, lastActiveDate)
  //   if (!isSecuritySessionDataDeleted) {
  //     return result.tokenError('refresh token not updated')
  //   }
  //
  //   return result.success(null)
  // }

  async registrationUser(dto: CreateUserInputDTO): Promise<UserId> {
    await this.validateLogin(dto.login);
    await this.validateEmail(dto.email);

    const passHash = await this.cryptoService.generateHash(dto.password);

    const user: UserDocument = this.UserModel.createUser({
      login: dto.login,
      email: dto.email,
      passwordHash: passHash,
    });

    await this.usersRepository.save(user);

    this.emailService.registration(dto.email, user.getEmailConfirmationCode());

    return user.id;
  }

  async registrationConfirmationEmail(
    dto: ConfirmationCodeInputDTO,
  ): Promise<void> {
    const user: UserDocument | null =
      await this.usersRepository.findUserByEmailConfirmationCode(dto.code);

    if (!user)
      throw new BadRequestException([
        {
          message: 'Incorrect code',
          field: 'code',
        },
      ]);

    if (!user.canBeConfirmed())
      throw new BadRequestException([
        {
          message: 'Confirmation code is expired or already been applied',
          field: 'code',
        },
      ]);

    user.confirmEmail(dto.code);

    await this.usersRepository.save(user);
  }

  async resendRegistrationEmail(dto: EmailResendingInputDTO): Promise<void> {
    const user: UserDocument | null =
      await this.usersRepository.findUserByLoginOrEmail(dto.email);

    if (!user) {
      throw new BadRequestException([
        {
          field: 'email',
          message: 'email not found',
        },
      ]);
    }

    if (!user.canBeConfirmed()) {
      throw new BadRequestException([
        {
          field: 'email',
          message: 'email already confirmed or expired',
        },
      ]);
    }

    user.changeEmailConfirmationCode();
    await this.usersRepository.save(user);
    this.emailService.registrationEmailResending(
      user.email,
      user.getEmailConfirmationCode(),
    );
  }

  // async updateTokens(refreshToken: string): Promise<ResultType<AuthTokensType>> {
  //   const oldRefreshTokenPayload: VerifyRefreshTokenViewModel | null = await jwtService.verifyRefreshToken(refreshToken)
  //
  //   if (!oldRefreshTokenPayload) {
  //     return result.tokenError('refresh token invalid')
  //   }
  //
  //   const isUserFound: boolean = await this.authRepository.isUserFound(oldRefreshTokenPayload.userId)
  //
  //   if (!isUserFound) {
  //     return result.notFound('user not found')
  //   }
  //
  //   const {userId, deviceId}: PayloadRefreshTokenInputType = oldRefreshTokenPayload
  //   const lastActiveDate: Date = new Date(oldRefreshTokenPayload.iat)
  //   const securitySessionQuery: SecuritySessionSearchQueryType = {
  //     deviceId,
  //     lastActiveDate
  //   }
  //
  //   const securitySession: HydratedSecurityType | null = await this.authRepository.getSecuritySession(securitySessionQuery)
  //   if (!securitySession) {
  //     return result.tokenError('session does not exist with current data')
  //   }
  //
  //   if (oldRefreshTokenPayload.userId !== securitySession.userId.toString()) {
  //     return result.tokenError('userId does not match current user')
  //   }
  //
  //   const tokens: AuthTokensType | null = await this.createAccessAndRefreshTokens(userId, deviceId)
  //
  //   if (!tokens) {
  //     return result.tokenError('error create access or refresh tokens')
  //   }
  //
  //   const newRefreshTokenPayload: VerifyRefreshTokenViewModel | null = await jwtService.verifyRefreshToken(tokens.refreshToken)
  //   if (!newRefreshTokenPayload) {
  //     return result.tokenError('error verify refresh token')
  //   }
  //
  //   const securitySessionUpdateData: SecurityUpdateType = {
  //     deviceId,
  //     lastActiveDate: new Date(newRefreshTokenPayload.iat),
  //     expireDate: new Date(newRefreshTokenPayload.exp),
  //   }
  //
  //   const isSecuritySessionUpdated: boolean = await this.authRepository.updateSecuritySessionData(securitySessionQuery, securitySessionUpdateData)
  //   if (!isSecuritySessionUpdated) {
  //     return result.tokenError('failed to update security session data')
  //   }
  //
  //   return result.success(tokens)
  // }

  async passwordRecovery(dto: PasswordRecoveryInputDTO): Promise<void> {
    const user: UserDocument | null =
      await this.usersRepository.findUserByLoginOrEmail(dto.email);

    if (!user) {
      return;
    }

    user.changePassRecoveryCode();

    this.emailService.passwordRecovery(user.email, user.getPassRecoveryCode());
  }

  async newPassword(dto: NewPasswordInputDTO): Promise<void> {
    const user: UserDocument | null =
      await this.usersRepository.findUserByPasswordRecoveryCode(
        dto.recoveryCode,
      );

    if (!user) {
      throw new BadRequestException({
        field: 'recoveryCode',
        message: 'Recovery Code is invalid',
      });
    }

    if (user.isPassRecoveryCodeExpired()) {
      throw new BadRequestException({
        field: 'recoveryCode',
        message: 'Recovery Code is expired',
      });
    }

    const newPassHash: string = await this.cryptoService.generateHash(
      dto.newPassword,
    );

    user.changePasswordAfterRecovery({
      recoveryCode: dto.recoveryCode,
      newPassHash: newPassHash,
    });

    await this.usersRepository.save(user);
  }
}

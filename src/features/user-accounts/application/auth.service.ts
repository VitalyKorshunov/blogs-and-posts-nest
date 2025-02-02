import { UsersRepository } from '../infrastructure/users.repository';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { UserContextDTO } from '../guards/dto/user-context.dto';
import { UserDocument } from '../domain/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
  ) {}

  async validateUser(
    loginOrEmail: string,
    password: string,
  ): Promise<UserContextDTO> {
    const user: UserDocument | null =
      await this.usersRepository.findUserByLoginOrEmail(loginOrEmail);

    if (!user) throw new UnauthorizedException();

    const isUserValid = await this.cryptoService.compareHash(
      password,
      user.passHash,
    );

    if (!isUserValid) throw new UnauthorizedException();

    return { userId: user.id };
  }

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
}

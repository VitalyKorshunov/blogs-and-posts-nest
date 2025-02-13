import { UsersRepository } from '../infrastructure/users.repository';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { UserContextDTO } from '../guards/dto/user-context.dto';
import { User } from '../domain/user.entity';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '../constants/auth-tokens.inject-constants';
import { JwtService } from '@nestjs/jwt';
import { UserId } from '../domain/dto/user.dto';
import {
  AccessAndRefreshTokensDTO,
  AccessTokenPayloadDTO,
  RefreshTokenPayloadDTO,
} from '../guards/dto/tokens.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private accessTokenContext: JwtService,
    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private refreshTokenContext: JwtService,
  ) {}

  async validateUser(
    loginOrEmail: string,
    password: string,
  ): Promise<UserContextDTO> {
    const user: User | null =
      await this.usersRepository.findUserByLoginOrEmail(loginOrEmail);

    if (!user) throw new UnauthorizedException();

    const isUserValid = await this.cryptoService.compareHash(
      password,
      user.passHash,
    );

    if (!isUserValid) throw new UnauthorizedException();

    return { userId: user.id };
  }

  createTokens(userId: UserId, deviceId: string): AccessAndRefreshTokensDTO {
    const accessTokenPayload: Omit<AccessTokenPayloadDTO, 'exp'> = {
      userId,
      lastActiveDate: new Date().toISOString(),
    };
    const refreshTokenPayload: Omit<RefreshTokenPayloadDTO, 'exp'> = {
      userId,
      deviceId,
      lastActiveDate: new Date().toISOString(),
    };

    const accessToken: string =
      this.accessTokenContext.sign(accessTokenPayload);
    const refreshToken: string =
      this.refreshTokenContext.sign(refreshTokenPayload);

    return { accessToken, refreshToken };
  }

  getRefreshTokenPayload(refreshToken: string): RefreshTokenPayloadDTO {
    return this.refreshTokenContext.decode(refreshToken);
  }
}

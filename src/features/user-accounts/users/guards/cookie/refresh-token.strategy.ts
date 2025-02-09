import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { RefreshTokenPayloadDTO } from '../dto/tokens.dto';
import { SecurityQueryRepository } from '../../../security/infrastructure/security.query-repository';
import { UserAccountsConfig } from '../../../user-accounts.config';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'refreshToken',
) {
  constructor(
    private securityQueryRepository: SecurityQueryRepository,
    private readonly userAccountsConfig: UserAccountsConfig,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => req.cookies?.refreshToken,
      ]),
      ignoreExpiration: false,
      secretOrKey: userAccountsConfig.refreshTokenSecret,
    });
  }

  async validate(
    payload: RefreshTokenPayloadDTO,
  ): Promise<RefreshTokenPayloadDTO> {
    const sessionFound: boolean =
      await this.securityQueryRepository.isSessionByDeviceIdAndLastActiveDateFound(
        payload.deviceId,
        payload.lastActiveDate,
      );
    if (!sessionFound) {
      throw new UnauthorizedException();
    }

    return payload;
  }
}

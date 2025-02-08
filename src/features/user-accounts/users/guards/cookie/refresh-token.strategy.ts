import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { SETTINGS } from '../../../../../settings';
import { RefreshTokenPayloadDTO } from '../dto/tokens.dto';
import { SecurityQueryRepository } from '../../../security/infrastructure/security.query-repository';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'refreshToken',
) {
  constructor(private securityQueryRepository: SecurityQueryRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => req.cookies?.refreshToken,
      ]),
      ignoreExpiration: false,
      secretOrKey: SETTINGS.TOKENS.REFRESH_TOKEN.SECRET_KEY,
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

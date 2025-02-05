import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { SETTINGS } from '../../../../settings';
import { RefreshTokenPayloadDTO } from '../dto/tokens.dto';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'refreshToken',
) {
  constructor() {
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
    return payload;
  }
}

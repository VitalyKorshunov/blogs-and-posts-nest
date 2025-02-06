import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { SETTINGS } from '../../../../../settings';
import { AccessTokenPayloadDTO } from '../dto/tokens.dto';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(
  Strategy,
  'accessToken',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: SETTINGS.TOKENS.ACCESS_TOKEN.SECRET_KEY,
    });
  }

  validate(payload: AccessTokenPayloadDTO): AccessTokenPayloadDTO {
    return payload;
  }
}

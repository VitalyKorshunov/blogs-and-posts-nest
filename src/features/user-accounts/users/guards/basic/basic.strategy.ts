import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy } from 'passport-http';
import { SETTINGS } from '../../../../../settings';

@Injectable()
export class BasicAuthStrategy extends PassportStrategy(BasicStrategy) {
  constructor() {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    if (
      username !== SETTINGS.AUTH.BASIC.username ||
      password !== SETTINGS.AUTH.BASIC.password
    ) {
      throw new UnauthorizedException();
    }

    return {};
  }
}

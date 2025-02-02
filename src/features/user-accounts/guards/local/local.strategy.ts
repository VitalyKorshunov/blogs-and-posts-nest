import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UserContextDTO } from '../dto/user-context.dto';
import { AuthService } from '../../application/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'loginOrEmail', //TODO: Типизировать
      passwordField: 'password', //TODO: Типизировать
    });
  }

  async validate(
    loginOrEmail: string,
    password: string,
  ): Promise<UserContextDTO> {
    const user: UserContextDTO = await this.authService.validateUser(
      loginOrEmail,
      password,
    );

    if (!user) throw new UnauthorizedException();

    return user;
  }
}

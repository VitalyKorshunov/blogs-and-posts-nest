import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UsersService } from '../application/users.service';
import { UserContextDto } from '../guards/dto/user-context.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      usernameField: 'loginOrEmail', //TODO: Типизировать
      passwordField: 'password', //TODO: Типизировать
    });
  }

  async validate(
    loginOrEmail: string,
    password: string,
  ): Promise<UserContextDto> {
    const user: UserContextDto = await this.usersService.validateUser(
      loginOrEmail,
      password,
    );

    if (!user) throw new UnauthorizedException();

    return user;
  }
}

import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UserContextDTO } from '../dto/user-context.dto';
import { AuthService } from '../../application/auth.service';
import { LoginInputDTO } from '../../api/input-dto/users.input-dto';
import { validateSync } from 'class-validator';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'loginOrEmail',
      passwordField: 'password',
    });
  }

  async validate(
    loginOrEmail: string,
    password: string,
  ): Promise<UserContextDTO> {
    const input = new LoginInputDTO();
    input.loginOrEmail = loginOrEmail;
    input.password = password;

    const errors = validateSync(input);

    if (errors.length) {
      throw new BadRequestException(errors);
    }

    const user: UserContextDTO = await this.authService.validateUser(
      loginOrEmail,
      password,
    );

    if (!user) throw new UnauthorizedException();

    return user;
  }
}

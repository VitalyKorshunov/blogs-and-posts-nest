import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserId } from '../../domain/dto/user.dto';
import { LoginSuccessDTO } from '../../api/view-dto/auth.view-dto';
import { JwtService } from '@nestjs/jwt';
import { UserContextDTO } from '../../guards/dto/user-context.dto';
import { Inject } from '@nestjs/common';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '../../constants/auth-tokens.inject-constants';

export class LoginUserCommand extends Command<LoginSuccessDTO> {
  constructor(public userId: UserId) {
    super();
  }
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<LoginUserCommand> {
  constructor(
    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private accessTokenContext: JwtService,
    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private refreshTokenContext: JwtService,
  ) {}

  async execute({ userId }: LoginUserCommand): Promise<LoginSuccessDTO> {
    const accessToken: string = this.accessTokenContext.sign({
      userId,
    } as UserContextDTO);
    const refreshToken: string = this.refreshTokenContext.sign({
      userId,
      deviceId: 'deviceId',
    });

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }
}

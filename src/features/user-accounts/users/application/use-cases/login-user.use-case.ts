import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserId } from '../../domain/dto/user.dto';
import { randomUUID } from 'crypto';
import { AuthService } from '../auth.service';
import { AccessAndRefreshTokensDTO } from '../../guards/dto/tokens.dto';
import { UsersRepository } from '../../infrastructure/users.repository';

class LoginUserCommandDTO {
  userId: UserId;
}

export class LoginUserCommand extends Command<AccessAndRefreshTokensDTO> {
  constructor(public dto: LoginUserCommandDTO) {
    super();
  }
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<LoginUserCommand> {
  constructor(
    private authService: AuthService,
    private usersRepository: UsersRepository,
  ) {}

  async execute({ dto }: LoginUserCommand): Promise<AccessAndRefreshTokensDTO> {
    await this.usersRepository.checkUserFoundOrNotFoundError(dto.userId);

    const deviceId: string = randomUUID();

    const tokens: AccessAndRefreshTokensDTO = this.authService.createTokens(
      dto.userId,
      deviceId,
    );

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }
}

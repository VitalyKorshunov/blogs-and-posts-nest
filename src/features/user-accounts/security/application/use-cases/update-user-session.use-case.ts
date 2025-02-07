import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityRepository } from '../../infrastructure/security.repository';
import { SecurityDocument } from '../../domain/security.entity';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../../users/application/auth.service';
import { RefreshTokenPayloadDTO } from '../../../users/guards/dto/tokens.dto';

class UpdateUserSessionCommandDTO {
  refreshToken: string;
}

export class UpdateUserSessionCommand extends Command<void> {
  constructor(public dto: UpdateUserSessionCommandDTO) {
    super();
  }
}

@CommandHandler(UpdateUserSessionCommand)
export class UpdateUserSessionUseCase
  implements ICommandHandler<UpdateUserSessionCommand>
{
  constructor(
    private securityRepository: SecurityRepository,
    private authService: AuthService,
  ) {}

  async execute({ dto }: UpdateUserSessionCommand): Promise<void> {
    const refreshTokenPayload: RefreshTokenPayloadDTO =
      this.authService.getRefreshTokenPayload(dto.refreshToken);

    const session: SecurityDocument | null =
      await this.securityRepository.findUserSessionByDeviceId(
        refreshTokenPayload.deviceId,
      );

    if (!session) {
      throw new UnauthorizedException('session not found');
    }

    session.updateSession({
      lastActiveDate: refreshTokenPayload.lastActiveDate,
      expireAt: new Date(refreshTokenPayload.exp).toISOString(),
    });

    await this.securityRepository.save(session);
  }
}

import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Security } from '../../domain/security.entity';
import { SecurityRepository } from '../../infrastructure/security.repository';
import { AuthService } from '../../../users/application/auth.service';
import { RefreshTokenPayloadDTO } from '../../../users/guards/dto/tokens.dto';

class CreateSessionCommandDTO {
  refreshToken: string;
  deviceName: string;
  ip: string;
}

export class CreateSessionCommand extends Command<void> {
  constructor(public dto: CreateSessionCommandDTO) {
    super();
  }
}

@CommandHandler(CreateSessionCommand)
export class CreateSessionUseCase
  implements ICommandHandler<CreateSessionCommand>
{
  constructor(
    private securityRepository: SecurityRepository,
    private authService: AuthService,
  ) {}

  async execute({ dto }: CreateSessionCommand): Promise<void> {
    const payload: RefreshTokenPayloadDTO =
      this.authService.getRefreshTokenPayload(dto.refreshToken);

    const session: Security = Security.createSession({
      userId: payload.userId,
      deviceId: payload.deviceId,
      deviceName: dto.deviceName,
      ip: dto.ip,
      lastActiveDate: payload.lastActiveDate,
      expireAt: new Date(payload.exp * 1000).toISOString(),
    });

    await this.securityRepository.createSession(session);
  }
}

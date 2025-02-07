import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import {
  Security,
  SecurityDocument,
  SecurityModelType,
} from '../../domain/security.entity';
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
    @InjectModel(Security.name) private SecurityModel: SecurityModelType,
    private securityRepository: SecurityRepository,
    private authService: AuthService,
  ) {}

  async execute({ dto }: CreateSessionCommand): Promise<void> {
    const payload: RefreshTokenPayloadDTO =
      this.authService.getRefreshTokenPayload(dto.refreshToken);

    const session: SecurityDocument = this.SecurityModel.createSession({
      userId: payload.userId,
      deviceId: payload.deviceId,
      deviceName: dto.deviceName,
      ip: dto.ip,
      lastActiveDate: payload.lastActiveDate,
      expireAt: new Date(payload.exp).toISOString(),
    });

    await this.securityRepository.save(session);
  }
}

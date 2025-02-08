import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateTokensViewDTO } from '../../api/view-dto/auth.view-dto';
import { AuthService } from '../auth.service';
import { UserId } from '../../domain/dto/user.dto';
import { DeviceId } from '../../../security/domain/dto/security.dto';

class UpdateTokensCommandDTO {
  userId: UserId;
  deviceId: DeviceId;
}

export class UpdateTokensCommand extends Command<UpdateTokensViewDTO> {
  constructor(public dto: UpdateTokensCommandDTO) {
    super();
  }
}

@CommandHandler(UpdateTokensCommand)
export class UpdateTokensUseCase
  implements ICommandHandler<UpdateTokensCommand>
{
  constructor(private authService: AuthService) {}

  async execute({ dto }: UpdateTokensCommand): Promise<UpdateTokensViewDTO> {
    return this.authService.createTokens(dto.userId, dto.deviceId);
  }
}

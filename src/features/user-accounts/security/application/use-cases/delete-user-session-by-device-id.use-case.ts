import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeviceId } from '../../domain/dto/security.dto';
import { UserId } from '../../../users/domain/dto/user.dto';
import { SecurityRepository } from '../../infrastructure/security.repository';
import { SecurityDocument } from '../../domain/security.entity';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

class DeleteUserSessionByDeviceIdCommandDTO {
  userId: UserId;
  deviceId: DeviceId;
  lastActiveDate: string;
}

export class DeleteUserSessionByDeviceIdCommand extends Command<void> {
  constructor(public dto: DeleteUserSessionByDeviceIdCommandDTO) {
    super();
  }
}

@CommandHandler(DeleteUserSessionByDeviceIdCommand)
export class DeleteUserSessionByDeviceIdUseCase
  implements ICommandHandler<DeleteUserSessionByDeviceIdCommand>
{
  constructor(private securityRepository: SecurityRepository) {}

  async execute({ dto }: DeleteUserSessionByDeviceIdCommand): Promise<void> {
    const session: SecurityDocument | null =
      await this.securityRepository.findUserSessionByDeviceId(
        dto.deviceId,
        dto.lastActiveDate,
      );

    if (!session) throw new NotFoundException('session not found');

    if (session.userId.toString() !== dto.userId) {
      throw new ForbiddenException(
        'this user cannot delete sessions that are not his own',
      );
    }

    await this.securityRepository.deleteUserSessionByDeviceId(dto.deviceId);
  }
}

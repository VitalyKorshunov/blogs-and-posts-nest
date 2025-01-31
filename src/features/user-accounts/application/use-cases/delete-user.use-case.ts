import { UsersRepository } from '../../infrastructure/users.repository';
import { UserId } from '../../dto/user.dto';
import { UserDocument } from '../../domain/user.entity';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class DeleteUserCommand {
  constructor(public userId: UserId) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase
  implements ICommandHandler<DeleteUserCommand, void>
{
  constructor(private usersRepository: UsersRepository) {}

  async execute({ userId }: DeleteUserCommand): Promise<void> {
    const user: UserDocument =
      await this.usersRepository.getUserByIdOrNotFoundError(userId);
    user.permanentDelete();
    await this.usersRepository.save(user);
  }
}

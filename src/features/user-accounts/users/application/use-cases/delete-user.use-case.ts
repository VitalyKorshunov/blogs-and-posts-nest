import { UsersRepository } from '../../infrastructure/users.repository';
import { UserId } from '../../domain/dto/user.dto';
import { User } from '../../domain/user.entity';
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
    const user: User =
      await this.usersRepository.getUserByIdOrNotFoundError(userId);
    user.permanentDelete();
    await this.usersRepository.updateUser(user);
  }
}

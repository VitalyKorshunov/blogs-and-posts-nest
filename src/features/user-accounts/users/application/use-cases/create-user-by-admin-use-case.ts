import { User } from '../../domain/user.entity';
import { UsersRepository } from '../../infrastructure/users.repository';
import { CreateUserInputDTO } from '../../api/input-dto/users.input-dto';
import { UserId } from '../../domain/dto/user.dto';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersService } from '../users.service';

export class CreateUserByAdminCommand extends Command<UserId> {
  constructor(public dto: CreateUserInputDTO) {
    super();
  }
}

@CommandHandler(CreateUserByAdminCommand)
export class CreateUserByAdminUseCase
  implements ICommandHandler<CreateUserByAdminCommand>
{
  constructor(
    private usersRepository: UsersRepository,
    private usersService: UsersService,
  ) {}

  async execute({ dto }: CreateUserByAdminCommand): Promise<UserId> {
    const user: User =
      await this.usersService.checkLoginAndEmailAndCreateUser(dto);

    user.confirmEmail(user.getEmailConfirmationCode());

    return await this.usersRepository.createUser(user);
  }
}

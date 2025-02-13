import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserId } from '../../domain/dto/user.dto';
import { CreateUserInputDTO } from '../../api/input-dto/users.input-dto';
import { UsersService } from '../users.service';
import { User } from '../../domain/user.entity';
import { UsersRepository } from '../../infrastructure/users.repository';
import { EmailService } from '../email-service/email.service';

export class RegistrationUserCommand extends Command<UserId> {
  constructor(public dto: CreateUserInputDTO) {
    super();
  }
}

@CommandHandler(RegistrationUserCommand)
export class RegistrationUserUseCase
  implements ICommandHandler<RegistrationUserCommand>
{
  constructor(
    private usersService: UsersService,
    private usersRepository: UsersRepository,
    private emailService: EmailService,
  ) {}

  async execute({ dto }: RegistrationUserCommand): Promise<UserId> {
    const user: User =
      await this.usersService.checkLoginAndEmailAndCreateUser(dto);

    const userId: UserId = await this.usersRepository.createUser(user);

    this.emailService.registration(dto.email, user.getEmailConfirmationCode());

    return userId;
  }
}

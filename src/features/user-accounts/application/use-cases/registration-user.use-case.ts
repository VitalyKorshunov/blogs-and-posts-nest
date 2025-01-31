import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserId } from '../../dto/user.dto';
import { CreateUserInputDTO } from '../../api/input-dto/users.input-dto';
import { UsersService } from '../users.service';
import { UserDocument } from '../../domain/user.entity';
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
    const user: UserDocument =
      await this.usersService.checkLoginAndEmailAndCreateUser(dto);

    await this.usersRepository.save(user);

    this.emailService.registration(dto.email, user.getEmailConfirmationCode());

    return user._id.toString();
  }
}

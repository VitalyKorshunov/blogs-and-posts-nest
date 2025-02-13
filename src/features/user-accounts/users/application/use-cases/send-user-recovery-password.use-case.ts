import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PasswordRecoveryInputDTO } from '../../api/input-dto/users.input-dto';
import { User } from '../../domain/user.entity';
import { UsersRepository } from '../../infrastructure/users.repository';
import { EmailService } from '../email-service/email.service';
import { UserAccountsConfig } from '../../../user-accounts.config';

export class SendUserRecoveryPasswordCommand extends Command<void> {
  constructor(public dto: PasswordRecoveryInputDTO) {
    super();
  }
}

@CommandHandler(SendUserRecoveryPasswordCommand)
export class SendUserRecoveryPasswordUseCase
  implements ICommandHandler<SendUserRecoveryPasswordCommand>
{
  constructor(
    private usersRepository: UsersRepository,
    private emailService: EmailService,
    private userAccountsConfig: UserAccountsConfig,
  ) {}

  async execute({ dto }: SendUserRecoveryPasswordCommand): Promise<void> {
    const user: User | null = await this.usersRepository.findUserByLoginOrEmail(
      dto.email,
    );

    if (!user) {
      return;
    }

    user.changePassRecoveryCode(
      this.userAccountsConfig.passwordRecoveryCodeExpiresInHours,
    );

    this.emailService.passwordRecovery(user.email, user.getPassRecoveryCode());
  }
}

import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EmailResendingInputDTO } from '../../api/input-dto/users.input-dto';
import { User } from '../../domain/user.entity';
import { BadRequestException } from '@nestjs/common';
import { UsersRepository } from '../../infrastructure/users.repository';
import { EmailService } from '../email-service/email.service';
import { UserAccountsConfig } from '../../../user-accounts.config';

export class ResendUserConfirmationEmailCommand extends Command<void> {
  constructor(public dto: EmailResendingInputDTO) {
    super();
  }
}

@CommandHandler(ResendUserConfirmationEmailCommand)
export class ResendUserConfirmationEmailUseCase
  implements ICommandHandler<ResendUserConfirmationEmailCommand>
{
  constructor(
    private usersRepository: UsersRepository,
    private emailService: EmailService,
    private userAccountsConfig: UserAccountsConfig,
  ) {}

  async execute({ dto }: ResendUserConfirmationEmailCommand): Promise<void> {
    const user: User | null = await this.usersRepository.findUserByLoginOrEmail(
      dto.email,
    );

    if (!user) {
      throw new BadRequestException([
        {
          field: 'email',
          message: 'email not found',
        },
      ]);
    }

    if (!user.canBeConfirmed()) {
      throw new BadRequestException([
        {
          field: 'email',
          message: 'email already confirmed or expired',
        },
      ]);
    }

    user.changeEmailConfirmationCode(
      this.userAccountsConfig.emailConfirmationCodeExpiresInHours,
    );
    await this.usersRepository.updateUser(user);
    this.emailService.registrationEmailResending(
      user.email,
      user.getEmailConfirmationCode(),
    );
  }
}

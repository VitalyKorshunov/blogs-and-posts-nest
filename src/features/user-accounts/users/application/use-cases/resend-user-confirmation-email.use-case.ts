import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EmailResendingInputDTO } from '../../api/input-dto/users.input-dto';
import { UserDocument } from '../../domain/user.entity';
import { BadRequestException } from '@nestjs/common';
import { UsersRepository } from '../../infrastructure/users.repository';
import { EmailService } from '../email-service/email.service';

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
  ) {}

  async execute({ dto }: ResendUserConfirmationEmailCommand): Promise<void> {
    const user: UserDocument | null =
      await this.usersRepository.findUserByLoginOrEmail(dto.email);

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

    user.changeEmailConfirmationCode();
    await this.usersRepository.save(user);
    this.emailService.registrationEmailResending(
      user.email,
      user.getEmailConfirmationCode(),
    );
  }
}

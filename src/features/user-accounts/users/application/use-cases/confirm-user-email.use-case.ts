import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConfirmationCodeInputDTO } from '../../api/input-dto/users.input-dto';
import { User } from '../../domain/user.entity';
import { BadRequestException } from '@nestjs/common';
import { UsersRepository } from '../../infrastructure/users.repository';

export class ConfirmUserEmailCommand extends Command<void> {
  constructor(public dto: ConfirmationCodeInputDTO) {
    super();
  }
}

@CommandHandler(ConfirmUserEmailCommand)
export class ConfirmUserEmailUseCase
  implements ICommandHandler<ConfirmUserEmailCommand>
{
  constructor(private usersRepository: UsersRepository) {}

  async execute({ dto }: ConfirmUserEmailCommand): Promise<void> {
    const user: User | null =
      await this.usersRepository.findUserByEmailConfirmationCode(dto.code);

    if (!user)
      throw new BadRequestException([
        {
          message: 'Incorrect code',
          field: 'code',
        },
      ]);

    if (!user.canBeConfirmed())
      throw new BadRequestException([
        {
          message: 'Confirmation code is expired or already been applied',
          field: 'code',
        },
      ]);

    user.confirmEmail(dto.code);

    await this.usersRepository.updateUser(user);
  }
}

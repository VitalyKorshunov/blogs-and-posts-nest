import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ChangeUserPasswordInputDTO } from '../../api/input-dto/users.input-dto';
import { User } from '../../domain/user.entity';
import { BadRequestException } from '@nestjs/common';
import { UsersRepository } from '../../infrastructure/users.repository';
import { CryptoService } from '../crypto.service';

export class ChangeUserPasswordCommand extends Command<void> {
  constructor(public dto: ChangeUserPasswordInputDTO) {
    super();
  }
}

@CommandHandler(ChangeUserPasswordCommand)
export class ChangeUserPasswordUseCase
  implements ICommandHandler<ChangeUserPasswordCommand>
{
  constructor(
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
  ) {}

  async execute({ dto }: ChangeUserPasswordCommand): Promise<void> {
    const user: User | null =
      await this.usersRepository.findUserByPasswordRecoveryCode(
        dto.recoveryCode,
      );

    if (!user) {
      throw new BadRequestException({
        field: 'recoveryCode',
        message: 'Recovery Code is invalid',
      });
    }

    if (user.isPassRecoveryCodeExpired()) {
      throw new BadRequestException({
        field: 'recoveryCode',
        message: 'Recovery Code is expired',
      });
    }

    const newPassHash: string = await this.cryptoService.generateHash(
      dto.newPassword,
    );

    user.changePasswordAfterRecovery({
      recoveryCode: dto.recoveryCode,
      newPassHash: newPassHash,
    });

    await this.usersRepository.updateUser(user);
  }
}

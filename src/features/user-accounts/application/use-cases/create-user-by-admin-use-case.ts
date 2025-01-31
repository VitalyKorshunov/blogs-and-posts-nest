import { UserDocument } from '../../domain/user.entity';
import { UsersRepository } from '../../infrastructure/users.repository';
import { CreateUserInputDTO } from '../../api/input-dto/users.input-dto';
import { UserId } from '../../dto/user.dto';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { validateOrRejectModel } from '../../../../core/validationOrReject';
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
    await validateOrRejectModel(dto, CreateUserInputDTO);

    const user: UserDocument =
      await this.usersService.checkLoginAndEmailAndCreateUser(dto);

    user.confirmEmail(user.getEmailConfirmationCode());

    await this.usersRepository.save(user);

    return user._id.toString();
  }
}

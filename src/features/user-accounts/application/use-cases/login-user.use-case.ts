import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserId } from '../../dto/user.dto';
import { LoginSuccessViewDTO } from '../../api/view-dto/auth.view-dto';
import { JwtService } from '@nestjs/jwt';
import { UserContextDto } from '../../guards/dto/user-context.dto';

export class LoginUserCommand extends Command<LoginSuccessViewDTO> {
  constructor(public userId: UserId) {
    super();
  }
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<LoginUserCommand> {
  constructor(private jwtService: JwtService) {}

  async execute({ userId }: LoginUserCommand): Promise<LoginSuccessViewDTO> {
    const accessToken: string = this.jwtService.sign({
      userId,
    } as UserContextDto);

    return { accessToken: accessToken };
  }
}

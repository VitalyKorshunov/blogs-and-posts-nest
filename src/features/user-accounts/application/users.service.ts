import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserModelType } from '../domain/user.entity';
import { UserId } from '../dto/user.dto';
import { UsersRepository } from '../infrastructure/users.repository';
import { CryptoService } from './crypto.service';
import { UserContextDto } from '../guards/dto/user-context.dto';
import { CreateUserInputDTO } from '../api/input-dto/users.input-dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
    private usersRepository: UsersRepository,
    private hashService: CryptoService,
  ) {}

  async validateUser(
    loginOrEmail: string,
    password: string,
  ): Promise<UserContextDto> {
    const user: UserDocument | null =
      await this.usersRepository.findUserByLoginOrEmail(loginOrEmail);

    if (!user) throw new UnauthorizedException();

    const isUserValid = await this.hashService.compareHash(
      password,
      user.passHash,
    );

    if (!isUserValid) throw new UnauthorizedException();

    return { userId: user.id };
  }

  async createUserByAdmin(dto: CreateUserInputDTO): Promise<UserId> {
    await this.validateLogin(dto.login);
    await this.validateEmail(dto.email);

    const passHash = await this.hashService.generateHash(dto.password);

    const user = this.UserModel.createUser({
      login: dto.login,
      email: dto.email,
      passwordHash: passHash,
    });

    user.confirmEmail(user.getEmailConfirmationCode());

    await this.usersRepository.save(user);

    return user._id.toString();
  }

  async deleteUser(id: UserId): Promise<void> {
    const user: UserDocument =
      await this.usersRepository.getUserByIdOrNotFoundError(id);
    user.permanentDelete();
    await this.usersRepository.save(user);

    return;
  }

  private async validateLogin(login: string): Promise<void> {
    if (login.includes('@')) throw new Error('Incorrect login');

    const isLoginExist: boolean =
      await this.usersRepository.isUserFoundByEmailOrLogin(login);

    if (isLoginExist) {
      throw new BadRequestException([
        {
          field: 'login',
          message: 'login should be unique',
        },
      ]);
    }
  }

  private async validateEmail(email: string): Promise<void> {
    if (!email.includes('@')) throw new Error('Incorrect email');

    const isEmailExist: boolean =
      await this.usersRepository.isUserFoundByEmailOrLogin(email);

    if (isEmailExist) {
      throw new BadRequestException([
        {
          field: 'email',
          message: 'email should be unique',
        },
      ]);
    }
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import { CreateUserInputDTO } from '../api/input-dto/users.input-dto';
import { User, UserDocument, UserModelType } from '../domain/user.entity';
import { CryptoService } from './crypto.service';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private UserModel: UserModelType,
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
  ) {}

  async checkLoginAndEmailAndCreateUser(
    dto: CreateUserInputDTO,
  ): Promise<UserDocument> {
    await this.validateLogin(dto.login);
    await this.validateEmail(dto.email);

    const passHash = await this.cryptoService.generateHash(dto.password);

    return this.UserModel.createUser({
      login: dto.login,
      email: dto.email,
      passwordHash: passHash,
    });
  }

  async validateLogin(login: string): Promise<void> {
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

  async validateEmail(email: string): Promise<void> {
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

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../domain/user.entity';
import { CreateUserDTO, UserId } from '../dto/user.dto';
import { UsersRepository } from '../infrastructure/users.repository';
import { HashService } from './hash.service';

@Injectable()
export class UsersAdminService {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
    private usersRepository: UsersRepository,
    private hashService: HashService,
  ) {}

  private async checkExistValueInField(
    field: string,
    value: string,
  ): Promise<boolean> {
    const isExist = await this.usersRepository.findUserByFieldAndValue(
      field,
      value,
    );

    return !!isExist;
  }

  async createUserByAdmin(
    dto: CreateUserDTO,
  ): Promise<UserId /*| ErrorsType*/> {
    /*const errors: ErrorsType = {
      errorsMessages: [],
    };
    const isLoginExist = await this.checkExistValueInField('login', dto.login);
    const isEmailExist = await this.checkExistValueInField('email', dto.email);
    if (isLoginExist)
      errors.errorsMessages.push({
        field: 'login',
        message: 'login should be unique',
      });
    if (isEmailExist)
      errors.errorsMessages.push({
        field: 'email',
        message: 'email should be unique',
      });

    if (errors.errorsMessages.length) {
      return errors;
    }*/

    const passHash = await this.hashService.generateHash(dto.password);

    const user = this.UserModel.createUser({
      login: dto.login,
      email: dto.email,
      password: passHash,
    });

    user.confirmEmail(user.getEmailConfirmationCode());

    await this.usersRepository.save(user);

    return user._id.toString();
  }

  async deleteUser(id: UserId): Promise<void> {
    const user = await this.usersRepository.findUserById(id);
    user.permanentDelete();
    await this.usersRepository.save(user);

    return;
  }
}

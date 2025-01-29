import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User, UserDocument, UserModelType } from '../domain/user.entity';
import { ObjectId } from 'mongodb';
import { InjectModel } from '@nestjs/mongoose';
import { UserId } from '../dto/user.dto';
import { DeletionStatus } from '../../../core/dto/deletion-statuses';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  async isUserFoundByEmailOrLogin(loginOrEmail: string): Promise<boolean> {
    const queryToDb = loginOrEmail.includes('@')
      ? { email: loginOrEmail }
      : { login: loginOrEmail };

    const isUserFound: number = await this.UserModel.countDocuments({
      ...queryToDb,
      deletionStatus: DeletionStatus.NotDeleted,
    });

    return !!isUserFound;
  }

  async checkUserFoundOrNotFoundError(userId: UserId): Promise<void> {
    const isUserFound: number = await this.UserModel.countDocuments({
      _id: new ObjectId(userId),
      deletionStatus: DeletionStatus.NotDeleted,
    });

    if (!isUserFound) throw new NotFoundException('user not found');
  }

  async findUserByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
    });
  }

  async findUserByLoginOrEmailOrUnauthorizedException(
    loginOrEmail: string,
  ): Promise<UserDocument | null> {
    const user: UserDocument | null = await this.UserModel.findOne({
      $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
    });

    if (!user) throw new UnauthorizedException();

    return user;
  }

  async getUserByIdOrNotFoundError(userId: UserId): Promise<UserDocument> {
    const user = await this.UserModel.findOne({
      _id: new ObjectId(userId),
      deletionStatus: DeletionStatus.NotDeleted,
    });

    if (!user) throw new NotFoundException('user not found');

    return user;
  }

  async save(user: UserDocument): Promise<void> {
    await user.save();
  }

  async findUserByEmailConfirmationCode(
    emailConfirmationCode: string,
  ): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      'emailConfirmation.confirmationCode': emailConfirmationCode,
    });
  }

  async findUserByPasswordRecoveryCode(
    passwordRecoveryCode: string,
  ): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      'recoveryPassword.recoveryCode': passwordRecoveryCode,
    });
  }
}

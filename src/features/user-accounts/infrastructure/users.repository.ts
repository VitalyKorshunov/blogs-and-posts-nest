import { Injectable, NotFoundException } from '@nestjs/common';
import { User, UserDocument, UserModelType } from '../domain/user.entity';
import { ObjectId } from 'mongodb';
import { InjectModel } from '@nestjs/mongoose';
import { UserId } from '../dto/user.dto';
import { DeletionStatus } from '../../../core/dto/deletion-statuses';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  async findUserByFieldAndValue(
    field: string,
    value: string,
  ): Promise<UserDocument | null> {
    const queryToDb =
      field === 'id' ? { _id: new ObjectId(value) } : { [field]: value };

    return this.UserModel.findOne({
      ...queryToDb,
      deletionStatus: DeletionStatus.NotDeleted,
    });
  }

  async checkUserFoundOrNotFoundError(userId: UserId): Promise<void> {
    const isUserFound: number = await this.UserModel.countDocuments({
      _id: new ObjectId(userId),
      deletionStatus: DeletionStatus.NotDeleted,
    });

    if (!isUserFound) throw new NotFoundException('user not found');
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
}

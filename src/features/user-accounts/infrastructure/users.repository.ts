import { Injectable } from '@nestjs/common';
import { User, UserDocument, UserModelType } from '../domain/user.entity';
import { ObjectId } from 'mongodb';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  async findUserByFieldAndValue(
    field: string,
    value: string,
  ): Promise<UserDocument | null> {
    const queryToDb =
      field === 'id' ? { _id: new ObjectId(value) } : { [field]: value };

    return this.UserModel.findOne(queryToDb);
  }

  async deleteUser(userId: string): Promise<number> {
    const user = await this.UserModel.deleteOne({ _id: new ObjectId(userId) });

    return user.deletedCount;
  }

  async save(user: UserDocument) {
    await user.save();
  }
}

import { ObjectId } from 'mongodb';

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserModelType } from '../../domain/user.entity';
import { UserId } from '../../dto/user.dto';
import { UserViewDto } from '../../api/view-dto/users.view-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { FilterQuery } from 'mongoose';
import { GetUsersQueryParams } from '../../api/input-dto/get-users-query-params.input-dto';
import { DeletionStatus } from '../../../../core/dto/deletion-statuses';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  async isUserFound(userId: UserId): Promise<boolean> {
    const user: number = await this.UserModel.countDocuments({
      _id: new ObjectId(userId),
      deletionStatus: DeletionStatus.NotDeleted,
    });

    return !!user;
  }

  async getUserByIdOrNotFoundError(id: UserId): Promise<UserViewDto> {
    const user: UserDocument | null = await this.UserModel.findOne({
      _id: new ObjectId(id),
      deletionStatus: DeletionStatus.NotDeleted,
    });

    if (!user) throw new NotFoundException('user not found');

    return UserViewDto.mapToView(user);
  }

  async getAllUsers(
    query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    const filter: FilterQuery<User> = {
      deletionStatus: DeletionStatus.NotDeleted,
    };

    if (query.searchLoginTerm) {
      filter.$or = filter.$or || [];
      filter.$or.push({
        login: { $regex: query.searchLoginTerm, $options: 'i' },
      });
    }

    if (query.searchEmailTerm) {
      filter.$or = filter.$or || [];
      filter.$or.push({
        email: { $regex: query.searchEmailTerm, $options: 'i' },
      });
    }

    const users = await this.UserModel.find(filter)
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalUsers = await this.UserModel.countDocuments(filter);

    const items = users.map((user) => UserViewDto.mapToView(user));

    return PaginatedViewDto.mapToView({
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalUsers,
      items,
    });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../../domain/user.entity';
import { UserId } from '../../domain/dto/user.dto';
import { UserViewDto } from '../../api/view-dto/users.view-dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { GetUsersQueryParams } from '../../api/input-dto/get-users-query-params.input-dto';
import { DeletionStatus } from '../../../../../core/dto/deletion-status';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

/*@Injectable()
export class UsersQueryRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  async getUserByIdOrNotFoundError(id: UserId): Promise<UserViewDto> {
    const user: User | null = await this.UserModel.findOne({
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
}*/

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getUserByIdOrNotFoundError(userId: UserId): Promise<UserViewDto> {
    const result = await this.dataSource.query(
      `
          SELECT u.id,
                 u.login,
                 u.email,
                 u."passHash",
                 u."deletionStatus",
                 u."deletedAt",
                 u."createdAt",
                 u."updatedAt",
                 rp."expirationPassDate",
                 rp."recoveryCode",
                 ec."expirationEmailDate",
                 ec."confirmationCode",
                 ec."isConfirmed"
          FROM (SELECT *
                FROM users
                WHERE id = $1
                  AND "deletionStatus" = $2) as u

                   LEFT JOIN "recoveryPassword" as rp
                             ON rp."userId" = u.id
                   LEFT JOIN "emailConfirmation" as ec
                             ON ec."userId" = u.id
      `,
      [userId, DeletionStatus.NotDeleted],
    );

    if (!result.length) throw new NotFoundException('user not found');

    return UserViewDto.mapToView(User.restoreUserFromDB(result[0]));
  }

  async getAllUsers(
    query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    const result = await this.dataSource.query(
      `
          WITH "usersTotalCount" AS (SELECT COUNT(*) AS count
                                     FROM users
                                     WHERE (login ILIKE $1
                                       OR email ILIKE $2)
                                       AND "deletionStatus" = $3)
          SELECT users.*, "usersTotalCount".count AS "usersTotalCount"
          FROM users,
               "usersTotalCount"
          WHERE (login ILIKE $1
            OR email ILIKE $2)
            AND "deletionStatus" = $3
          ORDER BY "${query.sortBy}" ${query.sortDirection}
          LIMIT $4 OFFSET $5

      `,
      [
        `%${query.searchLoginTerm ? query.searchLoginTerm : ''}%`, //$1
        `%${query.searchEmailTerm ? query.searchEmailTerm : ''}%`, //$2
        DeletionStatus.NotDeleted, //$3
        query.pageSize, //$4
        query.calculateSkip(), //$5
      ],
    );
    const totalUsers = Number(result[0]?.usersTotalCount ?? 0);
    /*  const filter: FilterQuery<User> = {
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
*/
    const items = result.map((user) =>
      UserViewDto.mapToView(User.restoreUserFromDB(user)),
    );

    return PaginatedViewDto.mapToView({
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalUsers,
      items,
    });
  }
}

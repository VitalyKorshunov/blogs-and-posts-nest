import { BaseSortablePaginationParams } from '../../../../../core/dto/base.query-params.input-dto';
import { UsersSortBy } from './users-sort-by';
import { IsEnum } from 'class-validator';

export class GetUsersQueryParams extends BaseSortablePaginationParams<UsersSortBy> {
  @IsEnum(UsersSortBy)
  sortBy: UsersSortBy = UsersSortBy.CreatedAt;

  searchLoginTerm?: string | null = null;
  searchEmailTerm?: string | null = null;
}

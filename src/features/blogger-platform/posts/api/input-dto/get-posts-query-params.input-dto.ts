import { BaseSortablePaginationParams } from '../../../../../core/dto/base.query-params.input-dto';
import { PostsSortBy } from './posts-sort-by';
import { IsEnum } from 'class-validator';

export class GetPostsQueryParamsInputDTO extends BaseSortablePaginationParams<PostsSortBy> {
  @IsEnum(PostsSortBy)
  sortBy: PostsSortBy = PostsSortBy.CreatedAt;
}

import { BaseSortablePaginationParams } from '../../../../../core/dto/base.query-params.input-dto';
import { CommentsSortBy } from './comments-sort-by';
import { IsEnum } from 'class-validator';

export class GetCommentsQueryParamsInputDTO extends BaseSortablePaginationParams<CommentsSortBy> {
  @IsEnum(CommentsSortBy)
  sortBy: CommentsSortBy = CommentsSortBy.CreatedAt;
}

import { BaseSortablePaginationParams } from '../../../../../core/dto/base.query-params.input-dto';
import { BlogsSortBy } from './blogs-sort-by';

export class GetBlogsQueryParamsInputDto extends BaseSortablePaginationParams<BlogsSortBy> {
  sortBy: BlogsSortBy = BlogsSortBy.CreatedAt;
  searchNameTerm?: string | null = null;
}

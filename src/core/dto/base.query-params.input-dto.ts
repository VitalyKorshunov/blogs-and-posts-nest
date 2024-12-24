import { Type } from 'class-transformer';

class PaginationParams {
  @Type(() => Number)
  pageNumber: number = 1;

  @Type(() => Number)
  pageSize: number = 10;

  calculateSkip() {
    return (this.pageNumber - 1) * this.pageSize;
  }
}

export enum SortDirection {
  Asc = 'asc',
  Desc = 'desc',
}

/**
 * Abstract base class for handling sortable pagination parameters.
 *
 * This class extends the basic pagination parameters (`PaginationParams`)
 * and adds sorting capabilities. It includes a default sorting direction
 * (`sortDirection`) set to descending order and requires a concrete
 * implementation to specify the sorting field (`sortBy`).
 *
 * @template T - The type of the field used for sorting.
 */
export abstract class BaseSortablePaginationParams<T> extends PaginationParams {
  sortDirection: SortDirection = SortDirection.Desc;
  abstract sortBy: T;
}

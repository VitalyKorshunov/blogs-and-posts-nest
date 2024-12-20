export abstract class PaginatedViewDto<T> {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  abstract items: T;

  public static mapToView<T>(data: {
    page: number;
    pageSize: number;
    totalCount: number;
    items: T;
  }): PaginatedViewDto<T> {
    return {
      pagesCount: Math.ceil(data.totalCount / data.pageSize),
      page: data.page,
      pageSize: data.pageSize,
      totalCount: data.totalCount,
      items: data.items,
    };
  }
}

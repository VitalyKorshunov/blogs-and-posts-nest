import { Injectable, NotFoundException } from '@nestjs/common';
import { Blog } from '../domain/blog.entity';
import { BlogId } from '../domain/dto/blog.dto';
import { BlogViewDto } from '../api/view-dto/blogs.view-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { GetBlogsQueryParamsInputDTO } from '../api/input-dto/get-blogs-query-params.input-dto';
import { DeletionStatus } from '../../../../core/dto/deletion-status';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async checkBlogByIdAndNotDeletedFoundOrNotFoundError(
    blogId: BlogId,
  ): Promise<void> {
    const result = await this.dataSource.query(
      `
          SELECT COUNT(*) > 0 AS "isFound"
          FROM blogs
          WHERE id = $1
            AND "deletionStatus" = $2
      `,
      [
        blogId, // $1
        DeletionStatus.NotDeleted, // $2
      ],
    );

    if (!result[0].isFound) throw new NotFoundException('blog not found');
  }

  async getBlogByIdAndNotDeletedOrNotFoundError(
    blogId: BlogId,
  ): Promise<BlogViewDto> {
    const result = await this.dataSource.query(
      `
          SELECT *
          FROM blogs
          WHERE id = $1
            AND "deletionStatus" = $2
      `,
      [
        blogId, // $1
        DeletionStatus.NotDeleted, // $2
      ],
    );

    if (!result.length) throw new NotFoundException('blog not found');

    return BlogViewDto.mapToView(Blog.restoreBlogFromDB(result[0]));
  }

  async getAllBlogs(
    query: GetBlogsQueryParamsInputDTO,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    const results = await this.dataSource.query(
      `
          WITH "totalBlogs" AS (SELECT COUNT(*) as count
                                FROM blogs
                                WHERE "deletionStatus" = $1
                                  AND name ILIKE $2)
          SELECT blogs.*,
                 "totalBlogs".count AS "totalBlogs"
          FROM blogs
          WHERE "deletionStatus" = $1
            AND name ILIKE $2
          ORDER BY ${query.sortBy} ${query.sortDirection}
          LIMIT $3 OFFSET $4
      `,
      [
        DeletionStatus.NotDeleted, // $1
        `%${query.searchNameTerm ?? ''}%`, // $2
        query.pageSize, // $3
        query.calculateSkip(), // $4
      ],
    );

    //****************
    const totalBlogs = Number(results[0]?.totalBlogs ?? 0);

    const items = results.map((result) =>
      BlogViewDto.mapToView(Blog.restoreBlogFromDB(result)),
    );

    return PaginatedViewDto.mapToView({
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalBlogs,
      items,
    });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { BlogId } from '../domain/dto/blog.dto';
import { DeletionStatus } from '../../../../core/dto/deletion-status';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Blog } from '../domain/blog.entity';

@Injectable()
export class BlogsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async createBlog(blog: Blog): Promise<BlogId> {
    const result = await this.dataSource.query(
      `
          INSERT INTO blogs (name, description, "websiteUrl", "isMembership", "createdAt", "updatedAt",
                             "deletionStatus", "deletedAt")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING id
      `,
      [
        blog.name, // $1
        blog.description, // $2
        blog.websiteUrl, // $3
        blog.isMembership, // $4
        blog.createdAt, // $5
        blog.updatedAt, // $6
        blog.deletionStatus, // $7
        blog.deletedAt, // $8
      ],
    );

    return result[0].id;
  }

  async updateBlog(blog: Blog): Promise<void> {
    await this.dataSource.query(
      `
          UPDATE blogs
          SET name             = $1,
              description      = $2,
              "websiteUrl"     = $3,
              "isMembership"   = $4,
              "updatedAt"      = $5,
              "deletionStatus" = $6,
              "deletedAt"      = $7
          WHERE id = $8
      `,
      [
        blog.name, // $1
        blog.description, // $2
        blog.websiteUrl, // $3
        blog.isMembership, // $4
        blog.updatedAt, // $5
        blog.deletionStatus, // $6
        blog.deletedAt, // $7
        blog.id, // $8
      ],
    );
  }

  async getBlogByIdAndNotDeletedOrNotFoundError(blogId: BlogId): Promise<Blog> {
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

    if (!result.lenght) throw new NotFoundException('blog not found');

    return Blog.restoreBlogFromDB(result[0]);
  }

  async isBlogByIdAndNotDeletedExist(blogId: BlogId): Promise<boolean> {
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

    return !!result[0].isFound;
  }
}

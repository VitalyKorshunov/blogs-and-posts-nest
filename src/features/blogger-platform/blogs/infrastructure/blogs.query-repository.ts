import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../domain/blog.entity';
import { BlogId } from '../dto/blog.dto';
import { ObjectId } from 'mongodb';
import { BlogViewDto } from '../api/view-dto/blog-view.dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { GetBlogsQueryParamsInputDto } from '../api/input-dto/get-blogs-query-params.input-dto';
import { FilterQuery } from 'mongoose';
import { DeletionStatus } from '../../../../core/dto/deletion-statuses';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: BlogModelType) {}

  async isBlogFound(blogId: BlogId): Promise<boolean> {
    const blog: number = await this.BlogModel.countDocuments({
      _id: new ObjectId(blogId),
      deletionStatus: DeletionStatus.NotDeleted,
    });

    return !!blog;
  }

  async getBlogByIdOrNotFoundError(blogId: BlogId): Promise<BlogViewDto> {
    const blog = await this.BlogModel.findOne({
      _id: new ObjectId(blogId),
      deletionStatus: DeletionStatus.NotDeleted,
    });

    if (!blog) throw new NotFoundException('blog not found');

    return BlogViewDto.mapToView(blog);
  }

  async getAllBlogs(
    query: GetBlogsQueryParamsInputDto,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    const filter: FilterQuery<Blog> = {
      deletionStatus: DeletionStatus.NotDeleted,
    };

    if (query.searchNameTerm) {
      filter.$or = filter.$or || [];
      filter.$or.push({
        name: { $regex: query.searchNameTerm, $options: 'i' },
      });
    }

    const blogs = await this.BlogModel.find(filter)
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalBlogs = await this.BlogModel.countDocuments(filter);

    const items = blogs.map((blog) => BlogViewDto.mapToView(blog));

    return PaginatedViewDto.mapToView({
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalBlogs,
      items,
    });
  }

  /* async findSortedPostsInBlog(
    blogId: BlogId,
    query: BlogQ,
  ): Promise<ResultType<PostsForBlogSortViewModel>> {
    const blogObjectId: ObjectId | null = new ObjectId(blogId);
    const isBlogFound = await this.isBlogFound(blogId);

    if (!isBlogFound) return result.notFound('blog not found');

    const queryFindAllPostsForBlog = { blogId: blogObjectId };

    const sortedQueryFields: SortOutputQueryType = sortQueryFieldsUtils(query);
    const filter: PostsForBlogQueryDbType = {
      ...sortedQueryFields,
    };

    const posts = await PostModel.find(queryFindAllPostsForBlog, { __v: 0 })
      .sort({ [filter.sortBy]: filter.sortDirection })
      .skip(filter.countSkips)
      .limit(filter.pageSize)
      .lean();

    const totalPostsCount = await PostModel.countDocuments(
      queryFindAllPostsForBlog,
    );
    const pagesCount = Math.ceil(totalPostsCount / filter.pageSize);

    const data: PostsForBlogSortViewModel = {
      pagesCount: pagesCount,
      page: filter.pageNumber,
      pageSize: filter.pageSize,
      totalCount: totalPostsCount,
      items: posts.map((post) => this.mapToPostViewModel(post)),
    };

    return result.success(data);
  }*/
}

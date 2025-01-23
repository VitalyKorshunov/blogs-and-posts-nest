import { Injectable, NotFoundException } from '@nestjs/common';
import { PostId } from '../dto/post.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument, PostModelType } from '../domain/post.entity';
import { ObjectId } from 'mongodb';
import { PostViewDto } from '../api/view-dto/posts.view-dto';
import { DeletionStatus } from '../../../../core/dto/deletion-statuses';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { GetPostsQueryParams } from '../api/input-dto/get-posts-query-params.input-dto';
import { FilterQuery } from 'mongoose';
import { BlogId } from '../../blogs/dto/blog.dto';

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectModel(Post.name) private PostModel: PostModelType) {}

  async isPostFound(postId: PostId): Promise<boolean> {
    const post: number = await this.PostModel.countDocuments({
      _id: new ObjectId(postId),
      deletionStatus: DeletionStatus.NotDeleted,
    });

    return !!post;
  }

  async getPostByIdOrNotFoundError(postId: PostId): Promise<PostViewDto> {
    const post: PostDocument | null = await this.PostModel.findOne({
      _id: new ObjectId(postId),
      deletionStatus: DeletionStatus.NotDeleted,
    });

    if (!post) throw new NotFoundException('post not found');

    return PostViewDto.mapToView(post);
  }

  //TODO: review getAllPosts, getAllPostsForBlog, queryPosts
  async getAllPosts(
    query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    return this.queryPosts(query);
  }

  //TODO: getAllPostsForBlog using in blogs.controller
  async getAllPostsForBlog(
    query: GetPostsQueryParams,
    blogId: BlogId,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    return this.queryPosts(query, blogId);
  }

  private async queryPosts(
    query: GetPostsQueryParams,
    blogId?: BlogId,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const filter: FilterQuery<Post> = {
      deletionStatus: DeletionStatus.NotDeleted,
    };

    if (blogId) {
      filter.blogId = new ObjectId(blogId);
    }

    const posts: PostDocument[] = await this.PostModel.find(filter)
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalPosts: number = await this.PostModel.countDocuments(filter);

    const items: PostViewDto[] = posts.map((post) =>
      PostViewDto.mapToView(post),
    );

    return PaginatedViewDto.mapToView({
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalPosts,
      items,
    });
  }
}

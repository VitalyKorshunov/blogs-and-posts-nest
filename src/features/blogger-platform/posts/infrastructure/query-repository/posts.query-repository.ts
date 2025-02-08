import { Injectable, NotFoundException } from '@nestjs/common';
import { PostId } from '../../domain/dto/post.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument, PostModelType } from '../../domain/post.entity';
import { ObjectId } from 'mongodb';
import { PostViewDto } from '../../api/view-dto/posts.view-dto';
import { DeletionStatus } from '../../../../../core/dto/deletion-status';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { FilterQuery } from 'mongoose';
import { UserOptionalContextDTO } from '../../../../user-accounts/users/guards/dto/user-context.dto';
import { LikeStatus } from '../../../likes/domain/dto/like-status';
import { LikesRepository } from '../../../likes/infrastucture/likes.repository';
import { GetAllPostsQueryContextDTO } from './dto/post-query.dto';
import { BlogId } from '../../../blogs/domain/dto/blog.dto';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
    private likesRepository: LikesRepository,
  ) {}

  async checkPostByIdOrNotFoundError(postId: PostId): Promise<void> {
    const post: number = await this.PostModel.countDocuments({
      _id: new ObjectId(postId),
      deletionStatus: DeletionStatus.NotDeleted,
    });

    if (!post) throw new NotFoundException('post not found');
  }

  async getPostByIdOrNotFoundError(
    postId: PostId,
    user: UserOptionalContextDTO,
  ): Promise<PostViewDto> {
    const post: PostDocument | null = await this.PostModel.findOne({
      _id: new ObjectId(postId),
      deletionStatus: DeletionStatus.NotDeleted,
    });

    if (!post) throw new NotFoundException('post not found');

    const userLikeStatusForPost =
      await this.likesRepository.findUserLikeStatusForEntity([post._id], user);

    return PostViewDto.mapToView(
      post,
      userLikeStatusForPost.length
        ? userLikeStatusForPost[0].userLikeStatus
        : LikeStatus.None,
    );
  }

  async getAllPosts(
    dto: GetAllPostsQueryContextDTO,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    return this.queryPosts(dto);
  }

  async getAllPostsForBlog(
    dto: GetAllPostsQueryContextDTO,
    blogId: BlogId,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    return this.queryPosts(dto, blogId);
  }

  private async queryPosts(
    dto: GetAllPostsQueryContextDTO,
    blogId?: BlogId,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const filter: FilterQuery<Post> = {
      deletionStatus: DeletionStatus.NotDeleted,
    };

    if (blogId) {
      filter.blogId = new ObjectId(blogId);
    }

    const posts: PostDocument[] = await this.PostModel.find(filter)
      .sort({ [dto.query.sortBy]: dto.query.sortDirection })
      .skip(dto.query.calculateSkip())
      .limit(dto.query.pageSize);

    const totalPosts: number = await this.PostModel.countDocuments(filter);

    const postIds: ObjectId[] = posts.map((post) => post._id);

    const postsWithUserLikeStatus =
      await this.likesRepository.findUserLikeStatusForEntity(postIds, dto.user);

    const items: PostViewDto[] = posts.map((post) => {
      const likeStatusForThisPost = postsWithUserLikeStatus.find(
        (like) => like.entityId === post._id.toString(),
      );

      return PostViewDto.mapToView(
        post,
        likeStatusForThisPost
          ? likeStatusForThisPost.userLikeStatus
          : LikeStatus.None,
      );
    });

    return PaginatedViewDto.mapToView({
      page: dto.query.pageNumber,
      pageSize: dto.query.pageSize,
      totalCount: totalPosts,
      items,
    });
  }
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument, PostModelType } from '../domain/post.entity';
import { PostsRepository } from '../infrastructure/posts.repository';
import {
  CreatePostInputDTO,
  UpdatePostInputDTO,
  UpdatePostLikeInputDTO,
} from '../api/input-dto/posts.input-dto';
import { PostId, UpdatePostLikesInfoDTO } from '../dto/post.dto';
import { BlogDocument } from '../../blogs/domain/blog.entity';
import { BlogsRepository } from '../../blogs/infrastructure/blogs.repository';
import { UserDocument } from '../../../user-accounts/domain/user.entity';
import { UsersRepository } from '../../../user-accounts/infrastructure/users.repository';
import {
  Like,
  LikeDocument,
  LikeModelType,
} from '../../likes/domain/like.entity';
import { LikesRepository } from '../../likes/infrastucture/likes.repository';
import {
  CreateLikeDTO,
  LastNewestLikes,
  LikesAndDislikesCount,
} from '../../likes/dto/like.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
    @InjectModel(Like.name) private LikeModel: LikeModelType,
    private postsRepository: PostsRepository,
    private blogsRepository: BlogsRepository,
    private usersRepository: UsersRepository,
    private likesRepository: LikesRepository,
  ) {}

  async createPost(dto: CreatePostInputDTO): Promise<PostId> {
    const blog: BlogDocument =
      await this.blogsRepository.getBlogByIdOrNotFoundError(dto.blogId);

    const post: PostDocument = this.PostModel.createPost({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: blog.id,
      blogName: blog.name,
    });

    await this.postsRepository.save(post);

    return post.id;
  }

  async deletePost(postId: PostId): Promise<void> {
    const post: PostDocument =
      await this.postsRepository.getPostByIdOrNotFoundError(postId);

    post.permanentDelete();

    await this.postsRepository.save(post);
  }

  async updatePost(dto: UpdatePostInputDTO, postId: PostId): Promise<void> {
    const blog: BlogDocument =
      await this.blogsRepository.getBlogByIdOrNotFoundError(dto.blogId);

    const post: PostDocument =
      await this.postsRepository.getPostByIdOrNotFoundError(postId);

    post.updatePost({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: blog.id,
      blogName: blog.name,
    });

    await this.postsRepository.save(post);
  }

  async updatePostLikeStatus(dto: UpdatePostLikeInputDTO): Promise<void> {
    const post: PostDocument =
      await this.postsRepository.getPostByIdOrNotFoundError(dto.postId);

    const user: UserDocument =
      await this.usersRepository.getUserByIdOrNotFoundError(dto.userId);

    let like: LikeDocument | null = await this.likesRepository.findLike(
      dto.postId,
      dto.userId,
    );

    if (like) {
      like.updateLike(dto.likeStatus);
    } else {
      const createLikeDTO: CreateLikeDTO = {
        commentOrPostId: dto.postId,
        likeStatus: dto.likeStatus,
        userId: dto.userId,
        login: user.login,
      };
      like = this.LikeModel.createLike(createLikeDTO);
    }

    await this.likesRepository.save(like);

    const likesAndDislikesCount: LikesAndDislikesCount =
      await this.likesRepository.getLikesAndDislikesCount(dto.postId);
    const lastThreeNewestLikes: LastNewestLikes[] =
      await this.likesRepository.getLastThreeNewestLikes(dto.postId);

    const updatePostLikesInfoDTO: UpdatePostLikesInfoDTO = {
      likesCount: likesAndDislikesCount.likesCount,
      dislikesCount: likesAndDislikesCount.dislikesCount,
      lastNewestLikes: lastThreeNewestLikes,
    };
    post.updateLikesInfo(updatePostLikesInfoDTO);

    await this.postsRepository.save(post);
  }
}

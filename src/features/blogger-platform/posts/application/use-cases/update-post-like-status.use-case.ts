import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostDocument } from '../../domain/post.entity';
import { User } from '../../../../user-accounts/users/domain/user.entity';
import {
  Like,
  LikeDocument,
  LikeModelType,
} from '../../../likes/domain/like.entity';
import {
  CreateLikeDTO,
  LastNewestLikes,
  LikesAndDislikesCount,
} from '../../../likes/domain/dto/like.dto';
import { UpdatePostLikesInfoDTO } from '../../domain/dto/post.dto';
import { InjectModel } from '@nestjs/mongoose';
import { LikesRepository } from '../../../likes/infrastucture/likes.repository';
import { UsersRepository } from '../../../../user-accounts/users/infrastructure/users.repository';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { LikeStatus } from '../../../likes/domain/dto/like-status';
import { BloggerPlatformConfig } from '../../../blogger-platform.config';

class UpdatePostLikeStatusCommandDTO {
  postId: string;
  userId: string;
  likeStatus: LikeStatus;
}

export class UpdatePostLikeStatusCommand extends Command<void> {
  constructor(public dto: UpdatePostLikeStatusCommandDTO) {
    super();
  }
}

@CommandHandler(UpdatePostLikeStatusCommand)
export class UpdatePostLikeStatusUseCase
  implements ICommandHandler<UpdatePostLikeStatusCommand>
{
  constructor(
    @InjectModel(Like.name) private LikeModel: LikeModelType,
    private likesRepository: LikesRepository,
    private postsRepository: PostsRepository,
    private usersRepository: UsersRepository,
    private bloggerPlatformConfig: BloggerPlatformConfig,
  ) {}

  async execute({ dto }: UpdatePostLikeStatusCommand): Promise<void> {
    //TODO: Promise.all
    const post: PostDocument =
      await this.postsRepository.getPostByIdOrNotFoundError(dto.postId);

    const user: User = await this.usersRepository.getUserByIdOrNotFoundError(
      dto.userId,
    );

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
    post.updateLikesInfo(
      updatePostLikesInfoDTO,
      this.bloggerPlatformConfig.lastNewestLikesCountForPost,
    );

    await this.postsRepository.save(post);
  }
}

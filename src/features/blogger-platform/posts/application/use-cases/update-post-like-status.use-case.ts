import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostDocument } from '../../domain/post.entity';
import { UserDocument } from '../../../../user-accounts/users/domain/user.entity';
import {
  Like,
  LikeDocument,
  LikeModelType,
} from '../../../likes/domain/like.entity';
import {
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
    const postPromise = this.postsRepository.getPostByIdOrNotFoundError(
      dto.postId,
    );

    const userPromise = this.usersRepository.getUserByIdOrNotFoundError(
      dto.userId,
    );

    const likePromise = this.likesRepository.findLike(dto.postId, dto.userId);

    const [post, user, like]: [
      PostDocument,
      UserDocument,
      LikeDocument | null,
    ] = await Promise.all([postPromise, userPromise, likePromise]);

    if (like) {
      like.updateLike(dto.likeStatus);

      await this.likesRepository.save(like);
    } else {
      const like = this.LikeModel.createLike({
        commentOrPostId: dto.postId,
        likeStatus: dto.likeStatus,
        userId: dto.userId,
        login: user.login,
      });

      await this.likesRepository.save(like);
    }

    const [likesAndDislikesCount, lastThreeNewestLikes]: [
      LikesAndDislikesCount,
      LastNewestLikes[],
    ] = await Promise.all([
      this.likesRepository.getLikesAndDislikesCount(dto.postId),

      this.likesRepository.getLastThreeNewestLikes(dto.postId),
    ]);

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

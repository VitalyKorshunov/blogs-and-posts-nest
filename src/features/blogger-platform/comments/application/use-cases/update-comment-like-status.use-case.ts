import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserDocument } from '../../../../user-accounts/users/domain/user.entity';
import {
  Like,
  LikeDocument,
  LikeModelType,
} from '../../../likes/domain/like.entity';
import { LikesAndDislikesCount } from '../../../likes/domain/dto/like.dto';
import { InjectModel } from '@nestjs/mongoose';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { UsersRepository } from '../../../../user-accounts/users/infrastructure/users.repository';
import { LikesRepository } from '../../../likes/infrastucture/likes.repository';
import { LikeStatus } from '../../../likes/domain/dto/like-status';
import { CommentDocument } from '../../domain/comment.entity';

class UpdateCommentLikeStatusCommandDTO {
  likeStatus: LikeStatus;
  commentId: string;
  userId: string;
}

export class UpdateCommentLikeStatusCommand extends Command<void> {
  constructor(public dto: UpdateCommentLikeStatusCommandDTO) {
    super();
  }
}

@CommandHandler(UpdateCommentLikeStatusCommand)
export class UpdateCommentLikeStatusUseCase
  implements ICommandHandler<UpdateCommentLikeStatusCommand>
{
  constructor(
    @InjectModel(Like.name) private LikeModel: LikeModelType,
    private likesRepository: LikesRepository,
    private commentsRepository: CommentsRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({ dto }: UpdateCommentLikeStatusCommand): Promise<void> {
    const commentPromise =
      this.commentsRepository.getCommentByIdOrNotFoundError(dto.commentId);

    const userPromise = this.usersRepository.getUserByIdOrNotFoundError(
      dto.userId,
    );

    const likePromise = this.likesRepository.findLike(
      dto.commentId,
      dto.userId,
    );

    const [comment, user, like]: [
      CommentDocument,
      UserDocument,
      LikeDocument | null,
    ] = await Promise.all([commentPromise, userPromise, likePromise]);

    if (like) {
      like.updateLike(dto.likeStatus);

      await this.likesRepository.save(like);
    } else {
      const like = this.LikeModel.createLike({
        commentOrPostId: dto.commentId,
        userId: dto.userId,
        login: user.login,
        likeStatus: dto.likeStatus,
      });

      await this.likesRepository.save(like);
    }

    const likesAndDislikesCount: LikesAndDislikesCount =
      await this.likesRepository.getLikesAndDislikesCount(dto.commentId);

    comment.updateLikeInfo(likesAndDislikesCount);

    await this.commentsRepository.save(comment);
  }
}

import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentDocument } from '../../domain/comment.entity';
import { User } from '../../../../user-accounts/users/domain/user.entity';
import {
  Like,
  LikeDocument,
  LikeModelType,
} from '../../../likes/domain/like.entity';
import {
  CreateLikeDTO,
  LikesAndDislikesCount,
} from '../../../likes/domain/dto/like.dto';
import { InjectModel } from '@nestjs/mongoose';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { UsersRepository } from '../../../../user-accounts/users/infrastructure/users.repository';
import { LikesRepository } from '../../../likes/infrastucture/likes.repository';
import { LikeStatus } from '../../../likes/domain/dto/like-status';

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
    //TODO: Promise.all
    const comment: CommentDocument =
      await this.commentsRepository.getCommentByIdOrNotFoundError(
        dto.commentId,
      );

    const user: User = await this.usersRepository.getUserByIdOrNotFoundError(
      dto.userId,
    );

    let like: LikeDocument | null = await this.likesRepository.findLike(
      dto.commentId,
      dto.userId,
    );

    if (like) {
      like.updateLike(dto.likeStatus);
    } else {
      const createLikeDTO: CreateLikeDTO = {
        commentOrPostId: dto.commentId,
        userId: dto.userId,
        login: user.login,
        likeStatus: dto.likeStatus,
      };

      like = this.LikeModel.createLike(createLikeDTO);
    }

    await this.likesRepository.save(like);

    const likesAndDislikesCount: LikesAndDislikesCount =
      await this.likesRepository.getLikesAndDislikesCount(dto.commentId);

    comment.updateLikeInfo(likesAndDislikesCount);

    await this.commentsRepository.save(comment);
  }
}

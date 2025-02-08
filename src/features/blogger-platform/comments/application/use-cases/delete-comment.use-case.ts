import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentDocument } from '../../domain/comment.entity';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { UsersRepository } from '../../../../user-accounts/users/infrastructure/users.repository';

class DeleteCommentCommandDTO {
  userId: string;
  commentId: string;
}

export class DeleteCommentCommand extends Command<void> {
  constructor(public dto: DeleteCommentCommandDTO) {
    super();
  }
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase
  implements ICommandHandler<DeleteCommentCommand>
{
  constructor(
    private commentsRepository: CommentsRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({ dto }: DeleteCommentCommand): Promise<void> {
    await this.usersRepository.checkUserFoundOrNotFoundError(dto.userId);

    const comment: CommentDocument =
      await this.commentsRepository.getCommentByIdOrNotFoundError(
        dto.commentId,
      );

    comment.validateUserOwnershipOrThrow(dto.userId);

    comment.permanentDelete();

    await this.commentsRepository.save(comment);
  }
}

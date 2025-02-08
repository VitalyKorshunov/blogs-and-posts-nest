import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentDocument } from '../../domain/comment.entity';
import { UpdateCommentDTO } from '../../domain/dto/comment.dto';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { UsersRepository } from '../../../../user-accounts/users/infrastructure/users.repository';

class UpdateCommentCommandDTO {
  userId: string;
  commentId: string;
  content: string;
}

export class UpdateCommentCommand extends Command<void> {
  constructor(public dto: UpdateCommentCommandDTO) {
    super();
  }
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase
  implements ICommandHandler<UpdateCommentCommand>
{
  constructor(
    private commentsRepository: CommentsRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({ dto }: UpdateCommentCommand): Promise<void> {
    await this.usersRepository.checkUserFoundOrNotFoundError(dto.userId);

    const comment: CommentDocument =
      await this.commentsRepository.getCommentByIdOrNotFoundError(
        dto.commentId,
      );

    comment.validateUserOwnershipOrThrow(dto.userId);

    const updateCommentDTO: UpdateCommentDTO = {
      content: dto.content,
    };
    comment.updateComment(updateCommentDTO);

    await this.commentsRepository.save(comment);
  }
}

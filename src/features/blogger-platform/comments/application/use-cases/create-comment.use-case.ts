import { CreateCommentInputDTO } from '../../api/input-dto/comments.input-dto';
import { CommentId, CreateCommentDTO } from '../../dto/comment.dto';
import { UserDocument } from '../../../../user-accounts/domain/user.entity';
import {
  Comment,
  CommentDocument,
  CommentModelType,
} from '../../domain/comment.entity';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { UsersRepository } from '../../../../user-accounts/infrastructure/users.repository';
import { InjectModel } from '@nestjs/mongoose';
import { CommentsRepository } from '../../infrastructure/comments.repository';

export class CreateCommentCommand extends Command<CommentId> {
  constructor(public dto: CreateCommentInputDTO) {
    super();
  }
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase
  implements ICommandHandler<CreateCommentCommand>
{
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    private commentsRepository: CommentsRepository,
    private postsRepository: PostsRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({ dto }: CreateCommentCommand): Promise<CommentId> {
    await this.postsRepository.checkPostFoundOrNotFoundError(dto.postId);

    const user: UserDocument =
      await this.usersRepository.getUserByIdOrNotFoundError(dto.userId);

    const createCommentDTO: CreateCommentDTO = {
      content: dto.content,
      postId: dto.postId,
      userId: dto.userId,
      userLogin: user.login,
    };

    const comment: CommentDocument =
      this.CommentModel.createComment(createCommentDTO);

    await this.commentsRepository.save(comment);

    return comment.id;
  }
}

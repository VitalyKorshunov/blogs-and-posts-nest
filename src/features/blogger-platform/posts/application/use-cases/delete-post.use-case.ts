import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostId } from '../../domain/dto/post.dto';
import { PostDocument } from '../../domain/post.entity';
import { PostsRepository } from '../../infrastructure/posts.repository';

export class DeletePostCommand extends Command<void> {
  constructor(public postId: PostId) {
    super();
  }
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(private postsRepository: PostsRepository) {}

  async execute({ postId }: DeletePostCommand): Promise<void> {
    const post: PostDocument =
      await this.postsRepository.getPostByIdOrNotFoundError(postId);

    post.permanentDelete();

    await this.postsRepository.save(post);
  }
}

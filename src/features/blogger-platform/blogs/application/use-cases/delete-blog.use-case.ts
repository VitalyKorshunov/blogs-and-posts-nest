import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogId } from '../../domain/dto/blog.dto';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { BlogDocument } from '../../domain/blog.entity';

export class DeleteBlogCommand extends Command<void> {
  constructor(public blogId: BlogId) {
    super();
  }
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  constructor(private blogsRepository: BlogsRepository) {}

  async execute({ blogId }: DeleteBlogCommand): Promise<void> {
    const blog: BlogDocument =
      await this.blogsRepository.getBlogByIdOrNotFoundError(blogId);

    blog.permanentDelete();

    await this.blogsRepository.save(blog);
  }
}

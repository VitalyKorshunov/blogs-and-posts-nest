import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { Blog } from '../../domain/blog.entity';

class UpdateBlogCommandDTO {
  name: string;
  description: string;
  websiteUrl: string;
  blogId: string;
}

export class UpdateBlogCommand extends Command<void> {
  constructor(public dto: UpdateBlogCommandDTO) {
    super();
  }
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(private blogsRepository: BlogsRepository) {}

  async execute({ dto }: UpdateBlogCommand): Promise<void> {
    const blog: Blog =
      await this.blogsRepository.getBlogByIdAndNotDeletedOrNotFoundError(
        dto.blogId,
      );

    blog.updateBlog({
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
    });

    await this.blogsRepository.updateBlog(blog);
  }
}

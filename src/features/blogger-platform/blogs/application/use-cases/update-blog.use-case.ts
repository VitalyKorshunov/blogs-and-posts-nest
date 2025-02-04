import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogDocument } from '../../domain/blog.entity';
import { BlogsRepository } from '../../infrastructure/blogs.repository';

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
    const blog: BlogDocument =
      await this.blogsRepository.getBlogByIdOrNotFoundError(dto.blogId);

    blog.updateBlog({
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
    });

    await this.blogsRepository.save(blog);
  }
}

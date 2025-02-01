import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateBlogInputDTO } from '../../api/input-dto/blogs.input-dto';
import { BlogId } from '../../dto/blog.dto';
import { BlogDocument } from '../../domain/blog.entity';
import { BlogsRepository } from '../../infrastructure/blogs.repository';

export class UpdateBlogCommand extends Command<void> {
  constructor(
    public dto: UpdateBlogInputDTO,
    public blogId: BlogId,
  ) {
    super();
  }
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(private blogsRepository: BlogsRepository) {}

  async execute({ dto, blogId }: UpdateBlogCommand): Promise<void> {
    const blog: BlogDocument =
      await this.blogsRepository.getBlogByIdOrNotFoundError(blogId);

    blog.updateBlog({
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
    });

    await this.blogsRepository.save(blog);
  }
}

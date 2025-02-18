import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogId } from '../../domain/dto/blog.dto';
import { CreateBlogInputDTO } from '../../api/input-dto/blogs.input-dto';
import { Blog, BlogDocument, BlogModelType } from '../../domain/blog.entity';
import { InjectModel } from '@nestjs/mongoose';
import { BlogsRepository } from '../../infrastructure/blogs.repository';

export class CreateBlogCommand extends Command<BlogId> {
  constructor(public dto: CreateBlogInputDTO) {
    super();
  }
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
    private blogsRepository: BlogsRepository,
  ) {}

  async execute({ dto }: CreateBlogCommand): Promise<BlogId> {
    const blog: BlogDocument = this.BlogModel.createBlog({
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
    });

    await this.blogsRepository.save(blog);
    return blog.id;
  }
}

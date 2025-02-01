import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogId } from '../../dto/blog.dto';
import { CreateBlogInputDTO } from '../../api/input-dto/blogs.input-dto';
import { validateOrRejectModel } from '../../../../../core/validationOrReject';
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
    await validateOrRejectModel(dto, CreateBlogInputDTO);

    const blog: BlogDocument = this.BlogModel.createBlog({
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
    });

    await this.blogsRepository.save(blog);
    return blog.id;
  }
}

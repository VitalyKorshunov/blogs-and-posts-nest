import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogId } from '../../domain/dto/blog.dto';
import { CreateBlogInputDTO } from '../../api/input-dto/blogs.input-dto';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Blog } from '../../domain/blog.entity';

export class CreateBlogCommand extends Command<BlogId> {
  constructor(public dto: CreateBlogInputDTO) {
    super();
  }
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private blogsRepository: BlogsRepository,
  ) {}

  async execute({ dto }: CreateBlogCommand): Promise<BlogId> {
    const blog: Blog = Blog.createBlog({
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
    });

    return await this.blogsRepository.createBlog(blog);
  }
}

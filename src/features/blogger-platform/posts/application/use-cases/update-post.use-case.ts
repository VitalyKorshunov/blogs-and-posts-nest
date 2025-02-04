import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogDocument } from '../../../blogs/domain/blog.entity';
import { PostDocument } from '../../domain/post.entity';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';

class UpdatePostCommandDTO {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  postId: string;
}

export class UpdatePostCommand extends Command<void> {
  constructor(public dto: UpdatePostCommandDTO) {
    super();
  }
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(
    private postsRepository: PostsRepository,
    private blogsRepository: BlogsRepository,
  ) {}

  async execute({ dto }: UpdatePostCommand): Promise<void> {
    const blog: BlogDocument =
      await this.blogsRepository.getBlogByIdOrNotFoundError(dto.blogId);

    const post: PostDocument =
      await this.postsRepository.getPostByIdOrNotFoundError(dto.postId);

    post.updatePost({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: blog.id,
      blogName: blog.name,
    });

    await this.postsRepository.save(post);
  }
}

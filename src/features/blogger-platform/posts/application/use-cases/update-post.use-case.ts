import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostDocument } from '../../domain/post.entity';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { Blog } from '../../../blogs/domain/blog.entity';

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
    const blog: Blog =
      await this.blogsRepository.getBlogByIdAndNotDeletedOrNotFoundError(
        dto.blogId,
      );

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

import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdatePostInputDTO } from '../../api/input-dto/posts.input-dto';
import { BlogDocument } from '../../../blogs/domain/blog.entity';
import { PostDocument } from '../../domain/post.entity';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { PostId } from '../../dto/post.dto';

export class UpdatePostCommand extends Command<void> {
  constructor(
    public dto: UpdatePostInputDTO,
    public postId: PostId,
  ) {
    super();
  }
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(
    private postsRepository: PostsRepository,
    private blogsRepository: BlogsRepository,
  ) {}

  async execute({ dto, postId }: UpdatePostCommand): Promise<void> {
    const blog: BlogDocument =
      await this.blogsRepository.getBlogByIdOrNotFoundError(dto.blogId);

    const post: PostDocument =
      await this.postsRepository.getPostByIdOrNotFoundError(postId);

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

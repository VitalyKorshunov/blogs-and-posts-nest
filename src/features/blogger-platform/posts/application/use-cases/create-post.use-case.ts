import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostId } from '../../dto/post.dto';
import { CreatePostInputDTO } from '../../api/input-dto/posts.input-dto';
import { BlogDocument } from '../../../blogs/domain/blog.entity';
import { Post, PostDocument, PostModelType } from '../../domain/post.entity';
import { InjectModel } from '@nestjs/mongoose';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';

export class CreatePostCommand extends Command<PostId> {
  constructor(public dto: CreatePostInputDTO) {
    super();
  }
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
    private postsRepository: PostsRepository,
    private blogsRepository: BlogsRepository,
  ) {}

  async execute({ dto }: CreatePostCommand): Promise<PostId> {
    const blog: BlogDocument =
      await this.blogsRepository.getBlogByIdOrNotFoundError(dto.blogId);

    const post: PostDocument = this.PostModel.createPost({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: blog.id,
      blogName: blog.name,
    });

    await this.postsRepository.save(post);

    return post.id;
  }
}

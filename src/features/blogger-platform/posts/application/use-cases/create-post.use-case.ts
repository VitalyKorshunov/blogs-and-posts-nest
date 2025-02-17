import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostId } from '../../domain/dto/post.dto';
import { Post, PostDocument, PostModelType } from '../../domain/post.entity';
import { InjectModel } from '@nestjs/mongoose';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { Blog } from '../../../blogs/domain/blog.entity';

class CreatePostCommandDTO {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
}

export class CreatePostCommand extends Command<PostId> {
  constructor(public dto: CreatePostCommandDTO) {
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
    const blog: Blog =
      await this.blogsRepository.getBlogByIdAndNotDeletedOrNotFoundError(
        dto.blogId,
      );

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

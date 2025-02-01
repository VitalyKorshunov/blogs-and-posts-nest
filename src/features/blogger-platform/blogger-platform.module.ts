import { Module } from '@nestjs/common';
import { BlogsControllers } from './blogs/api/blogs.controller';
import { PostsControllers } from './posts/api/posts.controller';
import { BlogsRepository } from './blogs/infrastructure/blogs.repository';
import { BlogsQueryRepository } from './blogs/infrastructure/blogs.query-repository';
import { PostsRepository } from './posts/infrastructure/posts.repository';
import { PostsQueryRepository } from './posts/infrastructure/posts.query-repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './blogs/domain/blog.entity';
import { Post, PostSchema } from './posts/domain/post.entity';
import { Comment, CommentSchema } from './comments/domain/comment.entity';
import { Like, LikeSchema } from './likes/domain/like.entity';
import { CommentsController } from './comments/api/comments.controller';
import { CommentsRepository } from './comments/infrastructure/comments.repository';
import { CommentsQueryRepository } from './comments/infrastructure/comments.query-repository';
import { LikesRepository } from './likes/infrastucture/likes.repository';
import { CreateCommentUseCase } from './comments/application/use-cases/create-comment.use-case';
import { DeleteCommentUseCase } from './comments/application/use-cases/delete-comment.use-case';
import { UpdateCommentUseCase } from './comments/application/use-cases/update-comment.use-case';
import { UpdateCommentLikeStatusUseCase } from './comments/application/use-cases/update-comment-like-status.use-case';
import { UsersRepository } from '../user-accounts/infrastructure/users.repository';
import { User, UserSchema } from '../user-accounts/domain/user.entity';
import { CreatePostUseCase } from './posts/application/use-cases/create-post.use-case';
import { DeletePostUseCase } from './posts/application/use-cases/delete-post.use-case';
import { UpdatePostUseCase } from './posts/application/use-cases/update-post.use-case';
import { UpdatePostLikeStatusUseCase } from './posts/application/use-cases/update-post-like-status.use-case';
import { CreateBlogUseCase } from './blogs/application/use-cases/create-blog.use-case';
import { DeleteBlogUseCase } from './blogs/application/use-cases/delete-blog.use-case';
import { UpdateBlogUseCase } from './blogs/application/use-cases/update-blog.use-case';

const blogUseCases = [CreateBlogUseCase, DeleteBlogUseCase, UpdateBlogUseCase];
const postUseCases = [
  CreatePostUseCase,
  DeletePostUseCase,
  UpdatePostUseCase,
  UpdatePostLikeStatusUseCase,
];
const commentUseCases = [
  CreateCommentUseCase,
  DeleteCommentUseCase,
  UpdateCommentUseCase,
  UpdateCommentLikeStatusUseCase,
];
const repositories = [
  BlogsRepository,
  BlogsQueryRepository,
  PostsRepository,
  PostsQueryRepository,
  CommentsRepository,
  CommentsQueryRepository,
  LikesRepository,
];

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Like.name, schema: LikeSchema },
      { name: User.name, schema: UserSchema }, //TODO: всегда ли указывается исходя из коммента ниже? { name: User.name, schema: UserSchema }
    ]),
  ],
  controllers: [BlogsControllers, PostsControllers, CommentsController],
  providers: [
    ...blogUseCases,
    ...postUseCases,
    ...commentUseCases,
    ...repositories,

    UsersRepository, //TODO providers UsersRepository или imports UsersAccountsModule?
  ],
  exports: [MongooseModule],
})
export class BloggerPlatformModule {}

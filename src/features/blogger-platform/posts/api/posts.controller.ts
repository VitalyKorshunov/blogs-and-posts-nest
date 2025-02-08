import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostsQueryRepository } from '../infrastructure/query-repository/posts.query-repository';
import {
  CreatePostInputDTO,
  UpdatePostInputDTO,
  UpdatePostLikeStatusInputDTO,
} from './input-dto/posts.input-dto';
import { PostViewDto } from './view-dto/posts.view-dto';
import { PostId } from '../domain/dto/post.dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { GetPostsQueryParamsInputDTO } from './input-dto/get-posts-query-params.input-dto';
import { CommentsQueryRepository } from '../../comments/infrastructure/query-repository/comments.query-repository';
import { CommandBus } from '@nestjs/cqrs';
import { CreatePostCommand } from '../application/use-cases/create-post.use-case';
import { DeletePostCommand } from '../application/use-cases/delete-post.use-case';
import { UpdatePostCommand } from '../application/use-cases/update-post.use-case';
import { ObjectIdValidationPipe } from '../../../../core/object-id-validation-transformation.pipe';
import { BasicAuthGuard } from '../../../user-accounts/users/guards/basic/basic.guard';
import { ApiBasicAuth, ApiBearerAuth } from '@nestjs/swagger';
import { CommentViewDTO } from '../../comments/api/view-dto/comments.view-dto';
import { GetCommentsQueryParamsInputDTO } from '../../comments/api/input-dto/get-comments-query-params.input-dto';
import {
  ExtractUserFromRequest,
  ExtractUserOptionalFromRequest,
} from '../../../user-accounts/users/guards/decorators/extract-user-from-request.decorator';
import { AccessTokenOptionalAuthGuard } from '../../../user-accounts/users/guards/bearer/access-token-optional-auth.guard';
import {
  UserContextDTO,
  UserOptionalContextDTO,
} from '../../../user-accounts/users/guards/dto/user-context.dto';
import { GetAllPostsQueryContextDTO } from '../infrastructure/query-repository/dto/post-query.dto';
import { GetAllCommentsForPostQueryContextDTO } from '../../comments/infrastructure/query-repository/dto/comment-query.dto';
import { AccessTokenAuthGuard } from '../../../user-accounts/users/guards/bearer/access-token.guard';
import { CreateCommentInputDTO } from '../../comments/api/input-dto/comments.input-dto';
import { CreateCommentCommand } from '../../comments/application/use-cases/create-comment.use-case';
import { CommentId } from '../../comments/domain/dto/comment.dto';
import { UpdatePostLikeStatusCommand } from '../application/use-cases/update-post-like-status.use-case';

@Controller('posts')
export class PostsControllers {
  constructor(
    private postsQueryRepository: PostsQueryRepository,
    private commentsQueryRepository: CommentsQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Put(':postId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AccessTokenAuthGuard)
  @ApiBearerAuth()
  async updateUserLikeStatusForPost(
    @Param('postId') postId: PostId,
    @Body() updatePostLikeStatusInputDTO: UpdatePostLikeStatusInputDTO,
    @ExtractUserFromRequest() user: UserContextDTO,
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdatePostLikeStatusCommand({
        postId: postId,
        likeStatus: updatePostLikeStatusInputDTO.likeStatus,
        userId: user.userId,
      }),
    );
  }

  @Get(':postId/comments')
  @UseGuards(AccessTokenOptionalAuthGuard)
  async getAllCommentsForPost(
    @Param('postId') postId: PostId,
    @Query() query: GetCommentsQueryParamsInputDTO,
    @ExtractUserOptionalFromRequest() user: UserOptionalContextDTO,
  ): Promise<PaginatedViewDto<CommentViewDTO[]>> {
    const dto: GetAllCommentsForPostQueryContextDTO = {
      postId: postId,
      query: query,
      user: user,
    };

    await this.postsQueryRepository.checkPostByIdOrNotFoundError(postId);

    return await this.commentsQueryRepository.getAllCommentsForPost(dto);
  }

  @Post(':postId/comments')
  @UseGuards(AccessTokenAuthGuard)
  @ApiBearerAuth()
  async createCommentInPost(
    @Param('postId') postId: PostId,
    @Body() createCommentInputDTO: CreateCommentInputDTO,
    @ExtractUserFromRequest() user: UserContextDTO,
  ): Promise<CommentViewDTO> {
    const commentId: CommentId = await this.commandBus.execute(
      new CreateCommentCommand({
        postId: postId,
        content: createCommentInputDTO.content,
        userId: user.userId,
      }),
    );

    return await this.commentsQueryRepository.getCommentByIdOrNotFoundError(
      commentId,
      user,
    );
  }

  @Get()
  @UseGuards(AccessTokenOptionalAuthGuard)
  async getAllPosts(
    @Query() query: GetPostsQueryParamsInputDTO,
    @ExtractUserOptionalFromRequest() user: UserOptionalContextDTO,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const dto: GetAllPostsQueryContextDTO = {
      query: query,
      user: user,
    };

    return await this.postsQueryRepository.getAllPosts(dto);
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth()
  async createPost(
    @Body() createPostInputDTO: CreatePostInputDTO,
  ): Promise<PostViewDto> {
    const postId: PostId = await this.commandBus.execute(
      new CreatePostCommand({
        title: createPostInputDTO.title,
        content: createPostInputDTO.content,
        blogId: createPostInputDTO.blogId,
        shortDescription: createPostInputDTO.shortDescription,
      }),
    );

    const user = { userId: null };
    return await this.postsQueryRepository.getPostByIdOrNotFoundError(
      postId,
      user,
    );
  }

  @Get(':postId')
  @UseGuards(AccessTokenOptionalAuthGuard)
  async getPost(
    @Param('postId', ObjectIdValidationPipe) postId: PostId,
    @ExtractUserOptionalFromRequest() user: UserOptionalContextDTO,
  ): Promise<PostViewDto> {
    return await this.postsQueryRepository.getPostByIdOrNotFoundError(
      postId,
      user,
    );
  }

  @Put(':postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth()
  async updatePost(
    @Param('postId', ObjectIdValidationPipe) postId: PostId,
    @Body() updatePostInputDTO: UpdatePostInputDTO,
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdatePostCommand({
        postId: postId,
        blogId: updatePostInputDTO.blogId,
        content: updatePostInputDTO.content,
        title: updatePostInputDTO.title,
        shortDescription: updatePostInputDTO.shortDescription,
      }),
    );
  }

  @Delete(':postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth()
  async deletePost(
    @Param('postId', ObjectIdValidationPipe) postId: PostId,
  ): Promise<void> {
    await this.commandBus.execute(new DeletePostCommand(postId));
  }
}

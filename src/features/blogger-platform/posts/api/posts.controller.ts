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
import { PostsQueryRepository } from '../infrastructure/posts.query-repository';
import {
  CreatePostInputDTO,
  UpdatePostInputDTO,
} from './input-dto/posts.input-dto';
import { PostViewDto } from './view-dto/posts.view-dto';
import { PostId } from '../dto/post.dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { GetPostsQueryParams } from './input-dto/get-posts-query-params.input-dto';
import { CommentsQueryRepository } from '../../comments/infrastructure/comments.query-repository';
import { CommandBus } from '@nestjs/cqrs';
import { CreatePostCommand } from '../application/use-cases/create-post.use-case';
import { DeletePostCommand } from '../application/use-cases/delete-post.use-case';
import { UpdatePostCommand } from '../application/use-cases/update-post.use-case';
import { ObjectIdValidationPipe } from '../../../../core/object-id-validation-transformation.pipe';
import { BasicAuthGuard } from '../../../user-accounts/guards/basic/basic.guard';
import { ApiBasicAuth } from '@nestjs/swagger';

@Controller('posts')
export class PostsControllers {
  constructor(
    private postsQueryRepository: PostsQueryRepository,
    private commentsQueryRepository: CommentsQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Post()
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth()
  async createPost(@Body() dto: CreatePostInputDTO): Promise<PostViewDto> {
    const postId: PostId = await this.commandBus.execute(
      new CreatePostCommand(dto),
    );

    return await this.postsQueryRepository.getPostByIdOrNotFoundError(postId);
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

  @Get(':postId')
  async getPost(
    @Param('postId', ObjectIdValidationPipe) postId: PostId,
  ): Promise<PostViewDto> {
    return await this.postsQueryRepository.getPostByIdOrNotFoundError(postId);
  }

  @Get()
  async getAllPosts(
    @Query() query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    return await this.postsQueryRepository.getAllPosts(query);
  }

  @Put(':postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth()
  async updatePost(
    @Param('postId', ObjectIdValidationPipe) postId: PostId,
    @Body() dto: UpdatePostInputDTO,
  ): Promise<PostViewDto> {
    await this.commandBus.execute(new UpdatePostCommand(dto, postId));

    return this.postsQueryRepository.getPostByIdOrNotFoundError(postId);
  }

  /*  async getCommentsInPost(
    req: Request<ParamType>,
    res: Response<CommentsSortViewModel>,
  ) {
    const userId = await accessTokenUtils.getAccessTokenUserId(req);
    const comments = await this.commentsQueryRepository.findAllCommentsForPost(
      req.params.id,
      req.query,
      userId,
    );

    res.status(200).json(comments);
  }

  async createCommentInPost(
    req: Request<ParamType, {}, CommentInputModel>,
    res: Response<CommentViewModel>,
  ) {
    const postId: PostId = req.params.id;
    const userId: UserId = req.user!.id;
    const inputComment: CommentInputModel = req.body;
    const result = await this.commentsService.createComment(
      postId,
      userId,
      inputComment,
    );

    if (result.statusCode !== StatusCode.Success) {
      res.sendStatus(404);
      return;
    }

    const commentId: CommentId = result.data;

    const comment = await this.commentsQueryRepository.findCommentById(
      commentId,
      userId,
    );

    if (comment) {
      res.status(201).json(comment);
    } else {
      res.sendStatus(500);
    }
  }

  async updateUserLikeStatusForPost(req: Request, res: Response) {}*/
}

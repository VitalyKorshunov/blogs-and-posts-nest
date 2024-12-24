import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { PostsService } from '../application/posts.service';
import { PostsQueryRepository } from '../infrastructure/posts.query-repository';
import {
  CreatePostInputDTO,
  UpdatePostInputDTO,
} from './input-dto/post.input-dto';
import { PostViewDto } from './view-dto/post.view-dto';
import { PostId } from '../dto/post.dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { GetPostsQueryParams } from './input-dto/get-posts-query-params.input-dto';

@Controller('posts')
export class PostsControllers {
  constructor(
    private postsService: PostsService,
    private postsQueryRepository: PostsQueryRepository,
    // private commentsService: CommentsService,
    // private commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @Post()
  async createPost(@Body() body: CreatePostInputDTO): Promise<PostViewDto> {
    const postId: PostId = await this.postsService.createPost(body);

    return await this.postsQueryRepository.getPostByIdOrNotFoundError(postId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') id: PostId): Promise<void> {
    await this.postsService.deletePost(id);
  }

  @Get(':id')
  async getPost(@Param('id') id: PostId): Promise<PostViewDto> {
    return await this.postsQueryRepository.getPostByIdOrNotFoundError(id);
  }

  @Get()
  async getAllPosts(
    @Query() query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    return await this.postsQueryRepository.getAllPosts(query);
  }

  @Post(':id')
  async updatePost(
    @Param('id') id: PostId,
    @Body() body: UpdatePostInputDTO,
  ): Promise<PostViewDto> {
    await this.postsService.updatePost(body, id);

    return this.postsQueryRepository.getPostByIdOrNotFoundError(id);
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

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
import { BlogsQueryRepository } from '../infrastructure/blogs.query-repository';
import {
  CreateBlogInputDTO,
  UpdateBlogInputDTO,
} from './input-dto/blogs.input-dto';
import { BlogId } from '../domain/dto/blog.dto';
import { BlogViewDto } from './view-dto/blogs.view-dto';
import { GetBlogsQueryParamsInputDTO } from './input-dto/get-blogs-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { PostsQueryRepository } from '../../posts/infrastructure/query-repository/posts.query-repository';
import { GetPostsQueryParamsInputDTO } from '../../posts/api/input-dto/get-posts-query-params.input-dto';
import { PostViewDto } from '../../posts/api/view-dto/posts.view-dto';
import { CreatePostForBlogInputDTO } from '../../posts/api/input-dto/posts.input-dto';
import { CommandBus } from '@nestjs/cqrs';
import { CreateBlogCommand } from '../application/use-cases/create-blog.use-case';
import { UpdateBlogCommand } from '../application/use-cases/update-blog.use-case';
import { DeleteBlogCommand } from '../application/use-cases/delete-blog.use-case';
import { CreatePostCommand } from '../../posts/application/use-cases/create-post.use-case';
import { ApiBasicAuth } from '@nestjs/swagger';
import { BasicAuthGuard } from '../../../user-accounts/guards/basic/basic.guard';
import { ObjectIdValidationPipe } from '../../../../core/object-id-validation-transformation.pipe';
import { JwtOptionalAuthGuard } from '../../../user-accounts/guards/bearer/jwt-optional-auth.guard';
import { ExtractUserOptionalFromRequest } from '../../../user-accounts/guards/decorators/extract-user-from-request.decorator';
import { UserOptionalContextDTO } from '../../../user-accounts/guards/dto/user-context.dto';
import { PostId } from '../../posts/domain/dto/post.dto';

@Controller('blogs')
export class BlogsControllers {
  constructor(
    private blogsQueryRepository: BlogsQueryRepository,
    private postsQueryRepository: PostsQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Get()
  async getAllBlogs(
    @Query() query: GetBlogsQueryParamsInputDTO,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    return await this.blogsQueryRepository.getAllBlogs(query);
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth()
  async createBlog(@Body() dto: CreateBlogInputDTO): Promise<BlogViewDto> {
    const blogId: BlogId = await this.commandBus.execute(
      new CreateBlogCommand({
        name: dto.name,
        description: dto.description,
        websiteUrl: dto.websiteUrl,
      }),
    );

    return await this.blogsQueryRepository.getBlogByIdOrNotFoundError(blogId);
  }

  @Get(':blogId/posts')
  @UseGuards(JwtOptionalAuthGuard)
  async getAllPostsForBlog(
    @Param('blogId', ObjectIdValidationPipe) blogId: BlogId,
    @Query() query: GetPostsQueryParamsInputDTO,
    @ExtractUserOptionalFromRequest() user: UserOptionalContextDTO,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    await this.blogsQueryRepository.checkBlogFoundOrNotFoundError(blogId);

    return await this.postsQueryRepository.getAllPostsForBlog(
      {
        user: user,
        query: query,
      },
      blogId,
    );
  }

  @Post(':blogId/posts')
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth()
  async createPostInBlog(
    @Param('blogId', ObjectIdValidationPipe) blogId: BlogId,
    @Body() createPostForBlogInputDTO: CreatePostForBlogInputDTO,
  ): Promise<PostViewDto> {
    const postId: PostId = await this.commandBus.execute(
      new CreatePostCommand({
        blogId: blogId,
        title: createPostForBlogInputDTO.title,
        shortDescription: createPostForBlogInputDTO.shortDescription,
        content: createPostForBlogInputDTO.content,
      }),
    );

    const user = { userId: null };

    return this.postsQueryRepository.getPostByIdOrNotFoundError(postId, user);
  }

  @Get(':blogId')
  async getBlog(
    @Param('blogId', ObjectIdValidationPipe) blogId: BlogId,
  ): Promise<BlogViewDto> {
    return await this.blogsQueryRepository.getBlogByIdOrNotFoundError(blogId);
  }

  @Put(':blogId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth()
  async updateBlog(
    @Body() updateBlogInputDTO: UpdateBlogInputDTO,
    @Param('blogId', ObjectIdValidationPipe) blogId: BlogId,
  ): Promise<BlogViewDto> {
    await this.commandBus.execute(
      new UpdateBlogCommand({
        blogId: blogId,
        name: updateBlogInputDTO.name,
        description: updateBlogInputDTO.description,
        websiteUrl: updateBlogInputDTO.websiteUrl,
      }),
    );

    return this.blogsQueryRepository.getBlogByIdOrNotFoundError(blogId);
  }

  @Delete(':blogId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth()
  async deleteBlog(
    @Param('blogId', ObjectIdValidationPipe) blogId: BlogId,
  ): Promise<void> {
    await this.commandBus.execute(new DeleteBlogCommand(blogId));
  }
}

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
import { BlogId } from '../dto/blog.dto';
import { BlogViewDto } from './view-dto/blogs.view-dto';
import { GetBlogsQueryParamsInputDto } from './input-dto/get-blogs-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { PostsQueryRepository } from '../../posts/infrastructure/posts.query-repository';
import { GetPostsQueryParams } from '../../posts/api/input-dto/get-posts-query-params.input-dto';
import { PostViewDto } from '../../posts/api/view-dto/posts.view-dto';
import {
  CreatePostForBlogInputDTO,
  CreatePostInputDTO,
} from '../../posts/api/input-dto/posts.input-dto';
import { CommandBus } from '@nestjs/cqrs';
import { CreateBlogCommand } from '../application/use-cases/create-blog.use-case';
import { UpdateBlogCommand } from '../application/use-cases/update-blog.use-case';
import { DeleteBlogCommand } from '../application/use-cases/delete-blog.use-case';
import { CreatePostCommand } from '../../posts/application/use-cases/create-post.use-case';
import { ApiBasicAuth } from '@nestjs/swagger';
import { BasicAuthGuard } from '../../../user-accounts/guards/basic/basic.guard';
import { ObjectIdValidationPipe } from '../../../../core/object-id-validation-transformation.pipe';

@Controller('blogs')
export class BlogsControllers {
  constructor(
    private blogsQueryRepository: BlogsQueryRepository,
    private postsQueryRepository: PostsQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Get()
  async getAllBlogs(
    @Query() query: GetBlogsQueryParamsInputDto,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    return await this.blogsQueryRepository.getAllBlogs(query);
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth()
  //TODO: хорошая ли практика сделать отдельный декоратор, который объединяет @UseGuards(LocalAuthGuard) и @ApiBasicAuth()?
  async createBlog(@Body() dto: CreateBlogInputDTO): Promise<BlogViewDto> {
    const blogId: BlogId = await this.commandBus.execute(
      new CreateBlogCommand(dto),
    );

    return await this.blogsQueryRepository.getBlogByIdOrNotFoundError(blogId);
  }

  @Get(':blogId/posts')
  async getAllPostsForBlog(
    @Param('blogId', ObjectIdValidationPipe) blogId: BlogId,
    @Query() query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    await this.blogsQueryRepository.checkBlogFoundOrNotFoundError(blogId);
    return await this.postsQueryRepository.getAllPostsForBlog(query, blogId);
  }

  @Post(':blogId/posts')
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth()
  async createPostInBlog(
    @Param('blogId', ObjectIdValidationPipe) blogId: BlogId,
    @Body() body: CreatePostForBlogInputDTO,
  ): Promise<PostViewDto> {
    const dto: CreatePostInputDTO = {
      ...body,
      blogId: blogId,
    };
    const postId = await this.commandBus.execute(new CreatePostCommand(dto));

    return this.postsQueryRepository.getPostByIdOrNotFoundError(postId);
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
    @Body() dto: UpdateBlogInputDTO,
    @Param('blogId', ObjectIdValidationPipe) blogId: BlogId,
  ): Promise<BlogViewDto> {
    await this.commandBus.execute(new UpdateBlogCommand(dto, blogId));

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

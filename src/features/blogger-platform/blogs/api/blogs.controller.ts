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
} from '@nestjs/common';
import { BlogsService } from '../application/blogs.service';
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
import { PostsService } from '../../posts/application/posts.service';

@Controller('blogs')
export class BlogsControllers {
  constructor(
    private blogsService: BlogsService,
    private blogsQueryRepository: BlogsQueryRepository,
    private postsService: PostsService,
    private postsQueryRepository: PostsQueryRepository,
  ) {}

  @Post()
  async createBlog(@Body() body: CreateBlogInputDTO): Promise<BlogViewDto> {
    const blogId: BlogId = await this.blogsService.createBlog(body);

    return await this.blogsQueryRepository.getBlogByIdOrNotFoundError(blogId);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Body() body: UpdateBlogInputDTO,
    @Param('id') id: BlogId,
  ): Promise<BlogViewDto> {
    await this.blogsService.updateBlog(body, id);

    return this.blogsQueryRepository.getBlogByIdOrNotFoundError(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: BlogId): Promise<void> {
    await this.blogsService.deleteBlog(id);
  }

  @Get(':id')
  async getBlog(@Param('id') id: BlogId): Promise<BlogViewDto> {
    return await this.blogsQueryRepository.getBlogByIdOrNotFoundError(id);
  }

  @Get()
  async getAllBlogs(
    @Query() query: GetBlogsQueryParamsInputDto,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    return await this.blogsQueryRepository.getAllBlogs(query);
  }

  @Post(':id/posts')
  async createPostInBlog(
    @Param('id') id: BlogId,
    @Body() body: CreatePostForBlogInputDTO,
  ): Promise<PostViewDto> {
    //TODO review from BLOG controller to POST SERVICE
    const dto: CreatePostInputDTO = {
      ...body,
      blogId: id,
    };
    const postId = await this.postsService.createPost(dto);

    return this.postsQueryRepository.getPostByIdOrNotFoundError(postId);
  }

  @Get(':id/posts')
  async getAllPostsForBlog(
    @Param('id') id: BlogId,
    @Query() query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    await this.blogsQueryRepository.checkBlogFoundOrNotFoundError(id);
    return await this.postsQueryRepository.getAllPostsForBlog(query, id);
  }
}

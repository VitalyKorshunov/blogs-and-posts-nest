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
} from './input-dto/blog.input-dto';
import { BlogId } from '../dto/blog.dto';
import { BlogViewDto } from './view-dto/blog-view.dto';
import { GetBlogsQueryParamsInputDto } from './input-dto/get-blogs-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';

@Controller('blogs')
export class BlogsControllers {
  constructor(
    private blogsService: BlogsService,
    private blogsQueryRepository: BlogsQueryRepository,
    /*    private postsService: PostsService,
    private postsQueryRepository: PostsQueryRepository,*/
  ) {}

  @Post()
  async createBlog(@Body() body: CreateBlogInputDTO): Promise<BlogViewDto> {
    const blogId: BlogId = await this.blogsService.createBlog(body);

    return await this.blogsQueryRepository.findBlogByIdOrNotFoundError(blogId);
  }

  @Put(':id')
  async updateBlog(
    @Body() body: UpdateBlogInputDTO,
    @Param('id') id: BlogId,
  ): Promise<void> {
    await this.blogsService.updateBlog(body, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: BlogId): Promise<void> {
    await this.blogsService.deleteBlog(id);
  }

  @Get(':id')
  async findBlog(@Param('id') id: BlogId): Promise<BlogViewDto> {
    return await this.blogsQueryRepository.findBlogByIdOrNotFoundError(id);
  }

  @Get()
  async findAllBlogs(
    @Query() query: GetBlogsQueryParamsInputDto,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    return await this.blogsQueryRepository.findAllBlogs(query);
  }

  /*  async createPostInBlog(
   req: Request<ParamType, {}, BlogPostInputModel>,
   res: Response<PostViewModel>,
 ) {
   const post: PostInputModel = {
     title: req.body.title,
     content: req.body.content,
     blogId: req.params.id,
     shortDescription: req.body.shortDescription,
   };

   const result = await this.postsService.createPostInBlog(post);

   if (result.statusCode === StatusCode.Success) {
     const postId: PostId = result.data;

     const post: PostViewModel =
       await this.postsQueryRepository.findPostById(postId);
     res.status(201).json(post);
   } else {
     res.sendStatus(404);
   }
 }*/

  /*  async getPostsInBlog(
    req: Request /!*<ParamType, {}, {}, SortQueryType>*!/,
    res: Response<PostsForBlogSortViewModel> /!*<BlogPostFilterViewModel>*!/,
  ) {
    const result = await this.blogsQueryRepository.getSortedPostsInBlog(
      req.params.id,
      req.query,
    );

    if (result.statusCode === StatusCode.Success) {
      const sortedPostsInBlog: PostsForBlogSortViewModel = result.data;
      res.status(200).json(sortedPostsInBlog);
    } else {
      res.sendStatus(404);
    }
  }*/
}

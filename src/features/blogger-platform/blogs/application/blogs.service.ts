import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument, BlogModelType } from '../domain/blog.entity';
import {
  CreateBlogInputDTO,
  UpdateBlogInputDTO,
} from '../api/input-dto/blog.input-dto';
import { BlogId } from '../dto/blog.dto';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
    private blogsRepository: BlogsRepository,
  ) {}

  async createBlog(dto: CreateBlogInputDTO): Promise<BlogId> {
    const blog: BlogDocument = this.BlogModel.createBlog({
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
    });

    await this.blogsRepository.save(blog);
    return blog.id;
  }

  async deleteBlog(blogId: BlogId): Promise<void> {
    const blog = await this.blogsRepository.getBlogByIdOrNotFoundError(blogId);

    blog.permanentDelete();

    await this.blogsRepository.save(blog);
  }

  async updateBlog(dto: UpdateBlogInputDTO, blogId: BlogId): Promise<void> {
    const blog: BlogDocument =
      await this.blogsRepository.getBlogByIdOrNotFoundError(blogId);

    blog.updateBlog({
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
    });

    await this.blogsRepository.save(blog);
  }
}

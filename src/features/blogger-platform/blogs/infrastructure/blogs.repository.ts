import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument, BlogModelType } from '../domain/blog.entity';
import { BlogId } from '../dto/blog.dto';
import { ObjectId } from 'mongodb';
import { DeletionStatus } from '../../../../core/dto/deletion-statuses';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: BlogModelType) {}

  async save(blog: BlogDocument): Promise<void> {
    await blog.save();
  }

  async getBlogByIdOrNotFoundError(blogId: BlogId): Promise<BlogDocument> {
    const blog: BlogDocument | null = await this.BlogModel.findOne({
      _id: new ObjectId(blogId),
      deletionStatus: DeletionStatus.NotDeleted,
    });

    if (!blog) throw new NotFoundException('blog not found');

    return blog;
  }
}

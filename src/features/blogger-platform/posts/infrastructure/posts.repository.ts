import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument, PostModelType } from '../domain/post.entity';
import { DeletionStatus } from '../../../../core/dto/deletion-statuses';
import { PostId } from '../dto/post.dto';
import { BlogId } from '../../blogs/dto/blog.dto';
import {
  Blog,
  BlogDocument,
  BlogModelType,
} from '../../blogs/domain/blog.entity';
import { ObjectId } from 'mongodb';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
  ) {}

  async getPostByIdOrNotFoundError(postId: PostId): Promise<PostDocument> {
    const post = await this.PostModel.findOne({
      _id: postId,
      deletionStatus: DeletionStatus.NotDeleted,
    });

    if (!post) throw new NotFoundException('post not found');

    return post;
  }

  async save(post: PostDocument): Promise<void> {
    await post.save();
  }

  async getBlogByIdOrNotFoundError(blogId: BlogId): Promise<BlogDocument> {
    const blog = await this.BlogModel.findOne({
      _id: new ObjectId(blogId),
      deletionStatus: DeletionStatus.NotDeleted,
    });

    if (!blog) throw new NotFoundException('blog not found');

    return blog;
  }
}

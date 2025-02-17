import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument, PostModelType } from '../domain/post.entity';
import { DeletionStatus } from '../../../../core/dto/deletion-status';
import { PostId } from '../domain/dto/post.dto';
import { ObjectId } from 'mongodb';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Post.name) private PostModel: PostModelType) {}

  async getPostByIdOrNotFoundError(postId: PostId): Promise<PostDocument> {
    const post = await this.PostModel.findOne({
      _id: new ObjectId(postId),
      deletionStatus: DeletionStatus.NotDeleted,
    });

    if (!post) throw new NotFoundException('post not found');

    return post;
  }

  async checkPostFoundOrNotFoundError(postId: PostId): Promise<void> {
    const isPostFound = await this.PostModel.countDocuments({
      _id: new ObjectId(postId),
      deletionStatus: DeletionStatus.NotDeleted,
    });

    if (!isPostFound) throw new NotFoundException('post not found');
  }

  async save(post: PostDocument): Promise<void> {
    await post.save();
  }
}

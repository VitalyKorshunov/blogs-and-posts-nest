import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { DeletionStatus } from '../../../../core/dto/deletion-statuses';
import { CreatePostDTO, UpdatePostDTO } from '../dto/post.dto';
import { ObjectId } from 'mongodb';
import { BadRequestException } from '@nestjs/common';

@Schema({ timestamps: true })
export class Post {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  shortDescription: string;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: Types.ObjectId, required: true })
  blogId: Types.ObjectId;

  @Prop({ type: String, required: true })
  blogName: string;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ enum: DeletionStatus, default: DeletionStatus.NotDeleted })
  deletionStatus: DeletionStatus;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  static createPost(dto: CreatePostDTO): PostDocument {
    const post = new this();

    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;
    post.blogId = new ObjectId(dto.blogId);
    post.blogName = dto.blogName;

    return post as PostDocument;
  }

  updatePost(dto: UpdatePostDTO): void {
    this.title = dto.title;
    this.content = dto.content;
    this.shortDescription = dto.shortDescription;
    this.blogId = new ObjectId(dto.blogId);
    this.blogName = dto.blogName;
  }

  permanentDelete() {
    if (this.deletionStatus === DeletionStatus.PermanentDeleted)
      throw new BadRequestException('post already deleted');

    this.deletionStatus = DeletionStatus.PermanentDeleted;
    this.deletedAt = new Date();
  }
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.loadClass(Post);

export type PostDocument = HydratedDocument<Post>;

export type PostModelType = Model<PostDocument> & typeof Post;

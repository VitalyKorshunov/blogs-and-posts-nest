import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { DeletionStatus } from '../../../../core/dto/deletion-statuses';
import {
  CreatePostDTO,
  UpdatePostDTO,
  UpdatePostLikesInfoDTO,
} from '../dto/post.dto';
import { ObjectId } from 'mongodb';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PostLikesInfo, PostLikesInfoSchema } from './post.likes-info.schema';
import { LAST_NEWEST_LIKES_COUNT_FOR_POST } from '../../../../main';

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

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({
    enum: DeletionStatus,
    type: String,
    default: DeletionStatus.NotDeleted,
  })
  deletionStatus: DeletionStatus;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  @Prop({ type: PostLikesInfoSchema })
  likesInfo: PostLikesInfo;

  static createPost(dto: CreatePostDTO): PostDocument {
    const post = new this();

    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;
    post.blogId = new ObjectId(dto.blogId);
    post.blogName = dto.blogName;

    post.likesInfo = {
      likesAndDislikesCount: {
        likesCount: 0,
        dislikesCount: 0,
      },
      newestUserLikes: [],
    };

    return post as PostDocument;
  }

  updatePost(dto: UpdatePostDTO): void {
    this.title = dto.title;
    this.content = dto.content;
    this.shortDescription = dto.shortDescription;
    this.blogId = new ObjectId(dto.blogId);
    this.blogName = dto.blogName;
  }

  updateLikesInfo(dto: UpdatePostLikesInfoDTO): void {
    if (dto.likesCount < 0 || dto.dislikesCount < 0) {
      throw new InternalServerErrorException(
        `'likesCount' and 'dislikesCount' must be greater than or equal 0`,
      );
    }
    if (dto.lastNewestLikes.length > LAST_NEWEST_LIKES_COUNT_FOR_POST) {
      throw new InternalServerErrorException(
        `the length of the array should not be more than ${LAST_NEWEST_LIKES_COUNT_FOR_POST}`,
      );
    }

    this.likesInfo.likesAndDislikesCount = {
      likesCount: dto.likesCount,
      dislikesCount: dto.dislikesCount,
    };
    this.likesInfo.newestUserLikes = dto.lastNewestLikes;
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

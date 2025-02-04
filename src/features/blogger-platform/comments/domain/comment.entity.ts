import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import {
  CreateCommentDTO,
  UpdateCommentDTO,
  UpdateCommentLikeInfoDTO,
} from './dto/comment.dto';
import { ObjectId } from 'mongodb';
import {
  CommentCommentatorInfo,
  CommentCommentatorInfoSchema,
} from './comment.commentator-info.schema';
import {
  CommentLikesInfo,
  CommentLikesInfoSchema,
} from './comment.likes-info.schema';
import { DeletionStatus } from '../../../../core/dto/deletion-status';
import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';

export const commentContentConstraints = {
  minLength: 20,
  maxLength: 300,
};

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: String, required: true, ...commentContentConstraints })
  content: string;

  @Prop({ type: Types.ObjectId, required: true })
  postId: Types.ObjectId;

  @Prop({ type: CommentCommentatorInfoSchema, required: true })
  commentatorInfo: CommentCommentatorInfo;

  @Prop({ type: CommentLikesInfoSchema, default: () => new CommentLikesInfo() })
  likesInfo: CommentLikesInfo;

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

  static createComment(dto: CreateCommentDTO): CommentDocument {
    const comment = new this();

    comment.content = dto.content;
    comment.postId = new ObjectId(dto.postId);
    comment.commentatorInfo = {
      userId: new ObjectId(dto.userId),
      userLogin: dto.userLogin,
    };

    return comment as CommentDocument;
  }

  permanentDelete(): void {
    if (this.deletionStatus === DeletionStatus.PermanentDeleted) {
      throw new BadRequestException('blog already deleted');
    }

    this.deletionStatus = DeletionStatus.PermanentDeleted;
    this.deletedAt = new Date();
  }

  updateComment(dto: UpdateCommentDTO): void {
    if (dto.content.length < 20 || dto.content.length > 300) {
      throw new BadRequestException(`'content' length must be in range 20-300`);
    }

    this.content = dto.content;
  }

  updateLikeInfo(dto: UpdateCommentLikeInfoDTO): void {
    if (dto.likesCount < 0 || dto.dislikesCount < 0) {
      throw new InternalServerErrorException(
        `'likesCount' and 'dislikesCount' must be greater than or equal 0`,
      );
    }
    this.likesInfo.likesAndDislikesCount.likesCount = dto.likesCount;
    this.likesInfo.likesAndDislikesCount.dislikesCount = dto.dislikesCount;
  }

  validateUserOwnershipOrThrow(userId: string): void {
    if (userId !== this.commentatorInfo.userId.toString()) {
      throw new ForbiddenException('comment does not belong to user'); //TODO: заменить кастомным исключением
    }
  }
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

CommentSchema.loadClass(Comment);

export type CommentDocument = HydratedDocument<Comment>;

export type CommentModelType = Model<CommentDocument> & typeof Comment;

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { CreateLikeDTO } from './dto/like.dto';
import { LikeStatus } from './dto/like-status';
import { ObjectId } from 'mongodb';

@Schema({ timestamps: true })
export class Like {
  @Prop({ type: Types.ObjectId, required: true })
  parentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, required: true })
  userLogin: string;

  @Prop({ enum: LikeStatus, type: String, required: true })
  likeStatus: LikeStatus;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  static createLike(dto: CreateLikeDTO): LikeDocument {
    const like = new this();
    like.parentId = new ObjectId(dto.commentOrPostId);
    like.userId = new ObjectId(dto.userId);
    like.userLogin = dto.login;
    like.likeStatus = dto.likeStatus;

    return like as LikeDocument;
  }

  updateLike(likeStatus: LikeStatus): void {
    this.likeStatus = likeStatus;
  }
}

export const LikeSchema = SchemaFactory.createForClass(Like);

LikeSchema.loadClass(Like);

export type LikeDocument = HydratedDocument<Like>;

export type LikeModelType = Model<LikeDocument> & typeof Like;

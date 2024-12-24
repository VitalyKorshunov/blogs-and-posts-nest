import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { LikeStatuses } from '../../../../core/dto/like-statuses';

@Schema({ _id: false, timestamps: true })
export class UserLikeStatus {
  @Prop({ type: Types.ObjectId, required: true })
  userId: Types.ObjectId;

  @Prop({ enum: LikeStatuses, required: true })
  likeStatus: LikeStatuses;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const UserLikeStatusSchema =
  SchemaFactory.createForClass(UserLikeStatus);

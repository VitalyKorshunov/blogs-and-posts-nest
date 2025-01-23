import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  CommentLikesAndDislikesCount,
  CommentLikesAndDislikesCountSchema,
} from './comment.likes-and-dislikes-count.schema';

@Schema({ _id: false })
export class CommentLikesInfo {
  @Prop({
    type: CommentLikesAndDislikesCountSchema,
    required: true,
    default: () => new CommentLikesAndDislikesCount(),
  })
  likesAndDislikesCount: CommentLikesAndDislikesCount;
}

export const CommentLikesInfoSchema =
  SchemaFactory.createForClass(CommentLikesInfo);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class CommentLikesAndDislikesCount {
  @Prop({ type: Number, required: true, default: 0 })
  likesCount: number;

  @Prop({ type: Number, required: true, default: 0 })
  dislikesCount: number;
}

export const CommentLikesAndDislikesCountSchema = SchemaFactory.createForClass(
  CommentLikesAndDislikesCount,
);

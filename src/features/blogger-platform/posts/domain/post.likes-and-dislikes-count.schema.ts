import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class PostLikesAndDislikesCount {
  @Prop({ type: Number, default: 0 })
  likesCount: number;

  @Prop({ type: Number, default: 0 })
  dislikesCount: number;
}

export const PostLikesAndDislikesCountSchema = SchemaFactory.createForClass(
  PostLikesAndDislikesCount,
);

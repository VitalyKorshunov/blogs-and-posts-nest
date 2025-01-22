import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class PostNewestUserLikes {
  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  login: string;

  @Prop({ type: String, required: true })
  addedAt: string;
}

export const PostNewestUserLikesSchema =
  SchemaFactory.createForClass(PostNewestUserLikes);

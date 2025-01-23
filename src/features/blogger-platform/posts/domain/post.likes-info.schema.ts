import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  PostLikesAndDislikesCount,
  PostLikesAndDislikesCountSchema,
} from './post.likes-and-dislikes-count.schema';
import {
  PostNewestUserLikes,
  PostNewestUserLikesSchema,
} from './post.newest-user-likes.schema';

@Schema({ _id: false })
export class PostLikesInfo {
  @Prop({ type: PostLikesAndDislikesCountSchema })
  likesAndDislikesCount: PostLikesAndDislikesCount;

  @Prop({ type: [PostNewestUserLikesSchema] })
  newestUserLikes: PostNewestUserLikes[];
}

export const PostLikesInfoSchema = SchemaFactory.createForClass(PostLikesInfo);

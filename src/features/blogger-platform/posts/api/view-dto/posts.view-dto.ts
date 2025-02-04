import { PostDocument } from '../../domain/post.entity';
import { LikeStatus } from '../../../likes/domain/dto/like-status';

class NewestLikes {
  addedAt: string;
  userId: string;
  login: string;
}

class ExtendedLikesInfo {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;
  newestLikes: NewestLikes[];
}

export class PostViewDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: ExtendedLikesInfo;

  static mapToView(
    post: PostDocument,
    userLikeStatus: LikeStatus,
  ): PostViewDto {
    const dto = new PostViewDto();
    dto.id = post.id;
    dto.title = post.title;
    dto.shortDescription = post.shortDescription;
    dto.content = post.content;
    dto.blogId = post.blogId.toString();
    dto.blogName = post.blogName;
    dto.createdAt = post.createdAt.toISOString();
    dto.extendedLikesInfo = {
      likesCount: post.likesInfo.likesAndDislikesCount.likesCount,
      dislikesCount: post.likesInfo.likesAndDislikesCount.dislikesCount,
      myStatus: userLikeStatus,
      newestLikes: post.likesInfo.newestUserLikes,
    };

    return dto;
  }
}

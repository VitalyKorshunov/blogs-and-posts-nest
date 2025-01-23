import { LikeStatus } from '../../../../core/dto/like-status';

export interface CreateLikeDTO {
  commentOrPostId: string;
  likeStatus: LikeStatus;
  userId: string;
  login: string;
}

export interface LikesAndDislikesCount {
  likesCount: number;
  dislikesCount: number;
}

export interface LastNewestLikes {
  addedAt: string;
  login: string;
  userId: string;
}

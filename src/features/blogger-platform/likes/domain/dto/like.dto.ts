import { LikeStatus } from './like-status';

export class CreateLikeDTO {
  readonly commentOrPostId: string;
  readonly likeStatus: LikeStatus;
  readonly userId: string;
  readonly login: string;
}

export class LikesAndDislikesCount {
  readonly likesCount: number;
  readonly dislikesCount: number;
}

export class LastNewestLikes {
  readonly addedAt: string;
  readonly login: string;
  readonly userId: string;
}

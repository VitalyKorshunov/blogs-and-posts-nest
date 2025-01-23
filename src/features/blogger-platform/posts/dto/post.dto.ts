export class CreatePostDTO {
  title: string;
  content: string;
  shortDescription: string;
  blogId: string;
  blogName: string;
}

export class UpdatePostDTO {
  title: string;
  content: string;
  shortDescription: string;
  blogId: string;
  blogName: string;
}

export interface UpdatePostLikesInfoDTO {
  dislikesCount: number;
  likesCount: number;
  lastNewestLikes: PostLastNewestLikes[];
}

export interface PostLastNewestLikes {
  addedAt: string;
  login: string;
  userId: string;
}

export type PostId = string;

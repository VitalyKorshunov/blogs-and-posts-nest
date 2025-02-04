export class CreateCommentDTO {
  content: string;
  postId: string;
  userId: string;
  userLogin: string;
}

export class UpdateCommentDTO {
  content: string;
}

export class UpdateCommentLikeInfoDTO {
  likesCount: number;
  dislikesCount: number;
}

export type CommentId = string;

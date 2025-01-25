import { LikeStatus } from '../../../../../core/dto/like-status';

export class CreateCommentInputDTO {
  postId: string;
  userId: string;
  content: string;
}

export class DeleteCommentInputDTO {
  userId: string;
  commentId: string;
}

export class UpdateCommentInputDTO {
  userId: string;
  commentId: string;
  content: string;
}

export class UpdateCommentLikeStatusInputDTO {
  commentId: string;
  userId: string;
  likeStatus: LikeStatus;
}

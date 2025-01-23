import { LikeStatus } from '../../../../../core/dto/like-status';

export interface CreateCommentInputDTO {
  postId: string;
  userId: string;
  content: string;
}

export interface DeleteCommentInputDTO {
  userId: string;
  commentId: string;
}

export interface UpdateCommentInputDTO {
  userId: string;
  commentId: string;
  content: string;
}

export interface UpdateCommentLikeStatusInputDTO {
  commentId: string;
  userId: string;
  likeStatus: LikeStatus;
}

import { LikeStatus } from '../../../likes/domain/dto/like-status';
import { CommentDocument } from '../../domain/comment.entity';

export class CommentatorInfo {
  userId: string;
  userLogin: string;
}

export class LikesInfo {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;
}

export class CommentViewDTO {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: string;
  likesInfo: LikesInfo;

  static mapToView(
    comment: CommentDocument,
    userLikeStatus: LikeStatus,
  ): CommentViewDTO {
    const dto = new CommentViewDTO();

    dto.id = comment.id;
    dto.content = comment.content;
    dto.commentatorInfo = {
      userId: comment.commentatorInfo.userId.toString(),
      userLogin: comment.commentatorInfo.userLogin,
    };
    dto.createdAt = comment.createdAt.toISOString();
    dto.likesInfo = {
      likesCount: comment.likesInfo.likesAndDislikesCount.likesCount,
      dislikesCount: comment.likesInfo.likesAndDislikesCount.dislikesCount,
      myStatus: userLikeStatus,
    };

    return dto;
  }
}

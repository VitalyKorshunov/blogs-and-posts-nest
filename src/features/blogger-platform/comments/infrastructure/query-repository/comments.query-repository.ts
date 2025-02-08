import { Injectable, NotFoundException } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { DeletionStatus } from '../../../../../core/dto/deletion-status';
import { CommentId } from '../../domain/dto/comment.dto';
import { CommentViewDTO } from '../../api/view-dto/comments.view-dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  Comment,
  CommentDocument,
  CommentModelType,
} from '../../domain/comment.entity';
import {
  UserContextDTO,
  UserOptionalContextDTO,
} from '../../../../user-accounts/users/guards/dto/user-context.dto';
import { LikesRepository } from '../../../likes/infrastucture/likes.repository';
import { LikeStatus } from '../../../likes/domain/dto/like-status';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { FilterQuery } from 'mongoose';
import { GetAllCommentsForPostQueryContextDTO } from './dto/comment-query.dto';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    private likesRepository: LikesRepository,
  ) {}

  async getCommentByIdOrNotFoundError(
    commentId: CommentId,
    user: UserOptionalContextDTO | UserContextDTO,
  ): Promise<CommentViewDTO> {
    const comment: CommentDocument | null = await this.CommentModel.findOne({
      _id: new ObjectId(commentId),
      deletionStatus: DeletionStatus.NotDeleted,
    });

    if (!comment) throw new NotFoundException('comment not found');

    const userLikeStatusForComment =
      await this.likesRepository.findUserLikeStatusForEntity(
        [comment._id],
        user,
      );

    return CommentViewDTO.mapToView(
      comment,
      userLikeStatusForComment.length
        ? userLikeStatusForComment[0].userLikeStatus
        : LikeStatus.None,
    );
  }

  async getAllCommentsForPost(
    dto: GetAllCommentsForPostQueryContextDTO,
  ): Promise<PaginatedViewDto<CommentViewDTO[]>> {
    const filter: FilterQuery<Comment> = {
      deletionStatus: DeletionStatus.NotDeleted,
      postId: new ObjectId(dto.postId),
    };

    const comments: CommentDocument[] = await this.CommentModel.find(filter)
      .sort({ [dto.query.sortBy]: dto.query.sortDirection })
      .skip(dto.query.calculateSkip())
      .limit(dto.query.pageSize);

    const totalComments: number =
      await this.CommentModel.countDocuments(filter);

    const commentIds: ObjectId[] = comments.map((comment) => comment._id);

    const commentsWithUserLikeStatus =
      await this.likesRepository.findUserLikeStatusForEntity(
        commentIds,
        dto.user,
      );

    const items: CommentViewDTO[] = comments.map((comment) => {
      const likeStatusForThisComment = commentsWithUserLikeStatus.find(
        (like) => like.entityId === comment._id.toString(),
      );

      return CommentViewDTO.mapToView(
        comment,
        likeStatusForThisComment
          ? likeStatusForThisComment.userLikeStatus
          : LikeStatus.None,
      );
    });

    return PaginatedViewDto.mapToView({
      page: dto.query.pageNumber,
      pageSize: dto.query.pageSize,
      totalCount: totalComments,
      items,
    });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { DeletionStatus } from '../../../../core/dto/deletion-statuses';
import { CommentId } from '../dto/comment.dto';
import { CommentViewDTO } from '../api/view-dto/comments.view-dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  Comment,
  CommentDocument,
  CommentModelType,
} from '../domain/comment.entity';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
  ) {}

  async getCommentByIdOrNotFoundError(
    commentId: CommentId,
  ): Promise<CommentViewDTO> {
    const comment: CommentDocument | null = await this.CommentModel.findOne({
      _id: new ObjectId(commentId),
      deletionStatus: DeletionStatus.NotDeleted,
    });

    if (!comment) throw new NotFoundException('comment not found');

    //TODO: Реализовать получение пользователя
    return CommentViewDTO.mapToView(comment);
  }
}

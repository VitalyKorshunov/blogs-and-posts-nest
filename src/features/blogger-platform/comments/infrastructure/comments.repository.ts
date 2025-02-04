import { Injectable, NotFoundException } from '@nestjs/common';
import { CommentId } from '../domain/dto/comment.dto';
import {
  Comment,
  CommentDocument,
  CommentModelType,
} from '../domain/comment.entity';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { DeletionStatus } from '../../../../core/dto/deletion-status';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
  ) {}

  async getCommentByIdOrNotFoundError(
    commentId: CommentId,
  ): Promise<CommentDocument> {
    const comment = await this.CommentModel.findOne({
      _id: new ObjectId(commentId),
      deletionStatus: DeletionStatus.NotDeleted,
    });

    if (!comment) throw new NotFoundException('comment not found');

    return comment;
  }

  async checkCommentFoundOrNotFoundError(commentId: CommentId): Promise<void> {
    const comment = await this.CommentModel.countDocuments({
      _id: new ObjectId(commentId),
      deletionStatus: DeletionStatus.NotDeleted,
    });

    if (!comment) throw new NotFoundException('comment not found');
  }

  async save(comment: CommentDocument): Promise<void> {
    await comment.save();
  }
}

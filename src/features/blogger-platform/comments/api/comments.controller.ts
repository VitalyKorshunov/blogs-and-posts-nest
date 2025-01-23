import { Controller, Get, Param } from '@nestjs/common';
import { CommentsService } from '../application/comments.service';
import { CommentsQueryRepository } from '../infrastructure/comments.query-repository';
import { CommentId } from '../dto/comment.dto';
import { CommentViewDTO } from './view-dto/comments.view-dto';

@Controller('comments')
export class CommentsController {
  constructor(
    private commentsService: CommentsService,
    private commentQueryRepository: CommentsQueryRepository,
  ) {}

  @Get(':id')
  getComment(@Param('id') commentId: CommentId): Promise<CommentViewDTO> {
    return this.commentQueryRepository.getCommentByIdOrNotFoundError(commentId);
  }

  /*  @Delete(':id')
    async deleteComment(@Param('id') id: string): Promise<Comment> {}*/
}

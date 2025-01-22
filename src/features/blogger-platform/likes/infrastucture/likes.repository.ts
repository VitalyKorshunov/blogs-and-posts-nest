import { Injectable } from '@nestjs/common';
import { Like, LikeDocument, LikeModelType } from '../domain/likes.entity';
import { ObjectId } from 'mongodb';
import { LikeStatus } from '../../../../core/dto/like-status';
import { InjectModel } from '@nestjs/mongoose';
import { LastNewestLikes, LikesAndDislikesCount } from '../dto/like.dto';
import { LAST_NEWEST_LIKES_COUNT_FOR_POST } from '../../../../main';

@Injectable()
export class LikesRepository {
  constructor(@InjectModel(Like.name) private LikeModel: LikeModelType) {}

  async save(likeModel: LikeDocument): Promise<void> {
    await likeModel.save();
  }

  async findLike(
    postOrCommentId: string,
    userId: string,
  ): Promise<LikeDocument | null> {
    return this.LikeModel.findOne({
      parentId: new ObjectId(postOrCommentId),
      userId: new ObjectId(userId),
    });
  }

  async getLikesAndDislikesCount(
    postOrCommentId: string,
  ): Promise<LikesAndDislikesCount> {
    const parentObjectId = new ObjectId(postOrCommentId);

    const likesCount = await this.LikeModel.countDocuments({
      parentId: parentObjectId,
      likeStatus: LikeStatus.Like,
    });

    const dislikesCount = await this.LikeModel.countDocuments({
      parentId: parentObjectId,
      likeStatus: LikeStatus.Dislike,
    });

    return {
      likesCount,
      dislikesCount,
    };
  }

  async getLastThreeNewestLikes(
    postOrCommentId: string,
  ): Promise<LastNewestLikes[]> {
    const likes: LikeDocument[] = await this.LikeModel.find({
      parentId: new ObjectId(postOrCommentId),
      likeStatus: LikeStatus.Like,
    })
      .sort({ createdAt: 'desc' })
      .limit(LAST_NEWEST_LIKES_COUNT_FOR_POST);

    return likes.map((like: LikeDocument): LastNewestLikes => {
      return {
        userId: like.userId.toString(),
        login: like.userLogin,
        addedAt: like.createdAt.toISOString(),
      };
    });
  }
}

import { Injectable } from '@nestjs/common';
import { Like, LikeDocument, LikeModelType } from '../domain/like.entity';
import { ObjectId } from 'mongodb';
import { LikeStatus } from '../domain/dto/like-status';
import { InjectModel } from '@nestjs/mongoose';
import { LastNewestLikes, LikesAndDislikesCount } from '../domain/dto/like.dto';
import { UserOptionalContextDTO } from '../../../user-accounts/users/guards/dto/user-context.dto';
import { BloggerPlatformConfig } from '../../blogger-platform.config';

@Injectable()
export class LikesRepository {
  constructor(
    @InjectModel(Like.name) private LikeModel: LikeModelType,
    private bloggerPlatformConfig: BloggerPlatformConfig,
  ) {}

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
    //TODO: Promise.all()
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
      .limit(this.bloggerPlatformConfig.lastNewestLikesCountForPost);

    return likes.map((like: LikeDocument): LastNewestLikes => {
      return {
        userId: like.userId.toString(),
        login: like.userLogin,
        addedAt: like.createdAt.toISOString(),
      };
    });
  }

  async findUserLikeStatusForEntity(
    entityIds: ObjectId[],
    user: UserOptionalContextDTO,
  ): Promise<
    {
      entityId: string;
      userLikeStatus: LikeStatus;
    }[]
  > {
    if (!user.userId) return [];

    const userLikeForEntities: LikeDocument[] = await this.LikeModel.find({
      parentId: { $in: entityIds },
      userId: new ObjectId(user.userId),
    });

    return userLikeForEntities.map((like: LikeDocument) => ({
      entityId: like.parentId.toString(),
      userLikeStatus: like.likeStatus,
    }));
  }
}

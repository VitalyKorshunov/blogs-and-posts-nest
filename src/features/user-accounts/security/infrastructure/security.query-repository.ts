import { Injectable } from '@nestjs/common';
import { UserId } from '../../users/domain/dto/user.dto';
import {
  Security,
  SecurityDocument,
  SecurityModelType,
} from '../domain/security.entity';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { SecurityViewDTO } from '../api/view-dto/security.view-dto';
import { DeviceId } from '../domain/dto/security.dto';

@Injectable()
export class SecurityQueryRepository {
  constructor(
    @InjectModel(Security.name) private SecurityModel: SecurityModelType,
  ) {}

  async getAllUserActiveSessions(userId: UserId): Promise<SecurityViewDTO[]> {
    const sessions: SecurityDocument[] = await this.SecurityModel.find({
      userId: new ObjectId(userId),
      expireAt: { $gt: new Date() },
    });

    return sessions.map((session) => SecurityViewDTO.mapToView(session));
  }

  async isSessionByDeviceIdFoundAndNotExpired(
    deviceId: DeviceId,
  ): Promise<boolean> {
    const session = await this.SecurityModel.countDocuments({
      deviceId,
      expireAt: { $gt: new Date() },
    });

    return !!session;
  }
}

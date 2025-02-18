import { Injectable } from '@nestjs/common';
import { UserId } from '../../users/domain/dto/user.dto';
import { DeviceId } from '../domain/dto/security.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  Security,
  SecurityDocument,
  SecurityModelType,
} from '../domain/security.entity';
import { ObjectId } from 'mongodb';

@Injectable()
export class SecurityRepository {
  constructor(
    @InjectModel(Security.name) private SecurityModel: SecurityModelType,
  ) {}

  async deleteAllUserSessionsExceptCurrent(
    userId: UserId,
    deviceId: DeviceId,
  ): Promise<boolean> {
    const session = await this.SecurityModel.deleteMany({
      userId: new ObjectId(userId),
      deviceId: { $ne: deviceId },
    });

    return !!session.deletedCount;
  }

  async deleteUserSessionByDeviceId(deviceId: DeviceId): Promise<boolean> {
    const session = await this.SecurityModel.deleteOne({ deviceId });

    return !!session.deletedCount;
  }

  async findUserSessionByDeviceId(
    deviceId: DeviceId,
    lastActiveDate: string,
  ): Promise<SecurityDocument | null> {
    return this.SecurityModel.findOne({
      deviceId,
      lastActiveDate: new Date(lastActiveDate),
    });
  }

  async save(securityModel: SecurityDocument): Promise<void> {
    await securityModel.save();
  }
}

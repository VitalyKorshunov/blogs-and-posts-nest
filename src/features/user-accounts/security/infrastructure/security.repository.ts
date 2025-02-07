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
  ): Promise<SecurityDocument | null> {
    return this.SecurityModel.findOne({
      deviceId,
    });
  }

  async save(securityModel: SecurityDocument): Promise<void> {
    await securityModel.save();
  }

  // async setSecuritySessionData(
  //   sessionData: SecurityInputModel,
  // ): Promise<boolean> {
  //   const { userId, ...rest } = sessionData;
  //   const mappedSessionData: SecurityDbType = {
  //     userId: new ObjectId(userId),
  //     ...rest,
  //   };
  //
  //   const isSecuritySessionSet = await SecurityModel.insertMany([
  //     mappedSessionData,
  //   ]);
  //
  //   return !!isSecuritySessionSet[0]._id;
  // }

  // async getSecuritySession(
  //   securitySessionQuery: SecuritySessionSearchQueryType,
  // ): Promise<HydratedSecurityType | null> {
  //   return SecurityModel.findOne(securitySessionQuery);
  // }

  // async deleteSecuritySessionData(
  //   deviceId: DeviceId,
  //   lastActiveDate: Date,
  // ): Promise<boolean> {
  //   const result = await SecurityModel.deleteOne({ deviceId, lastActiveDate });
  //
  //   return !!result.deletedCount;
  // }

  // async updateSecuritySessionData(
  //   securitySessionQuery: SecuritySessionSearchQueryType,
  //   securitySessionUpdateData: SecurityUpdateType,
  // ): Promise<boolean> {
  //   const result = await SecurityModel.updateOne(securitySessionQuery, {
  //     $set: securitySessionUpdateData,
  //   });
  //
  //   return !!result.matchedCount;
  // }
}

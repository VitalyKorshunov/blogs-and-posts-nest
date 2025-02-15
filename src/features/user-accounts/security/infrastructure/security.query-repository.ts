import { Injectable } from '@nestjs/common';
import { UserId } from '../../users/domain/dto/user.dto';
import { Security } from '../domain/security.entity';
import { SecurityViewDTO } from '../api/view-dto/security.view-dto';
import { DeviceId } from '../domain/dto/security.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class SecurityQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getAllUserActiveSessions(userId: UserId): Promise<SecurityViewDTO[]> {
    const sessions = await this.dataSource.query(
      `
          SELECT "deviceId", "userId", "deviceName", ip, "lastActiveDate", "expireAt"
          FROM security
          WHERE "userId" = $1
            AND "expireAt" > $2
      `,
      [userId, new Date()],
    );

    return sessions.map((session) =>
      SecurityViewDTO.mapToView(Security.restoreSessionFromDB(session)),
    );
  }

  async isSessionByDeviceIdAndLastActiveDateFound(
    deviceId: DeviceId,
    lastActiveDate: string,
  ): Promise<boolean> {
    const session = await this.dataSource.query(
      `
          SELECT COUNT(*) > 0 AS count
          FROM security
          WHERE "deviceId" = $1
            AND "lastActiveDate" = $2
      `,
      [
        deviceId, // $1
        lastActiveDate, // $2
      ],
    );
    console.log(session[0].count);
    return session[0].count;
  }
}

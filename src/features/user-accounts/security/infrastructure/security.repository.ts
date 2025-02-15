import { Injectable } from '@nestjs/common';
import { UserId } from '../../users/domain/dto/user.dto';
import { DeviceId } from '../domain/dto/security.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Security } from '../domain/security.entity';

@Injectable()
export class SecurityRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async deleteAllUserSessionsExceptCurrent(
    userId: UserId,
    deviceId: DeviceId,
  ): Promise<void> {
    await this.dataSource.query(
      `
          DELETE
          FROM security
          WHERE "userId" = $1
            AND "deviceId" != $2
      `,
      [userId, deviceId],
    );
  }

  async deleteUserSessionByDeviceId(deviceId: DeviceId): Promise<void> {
    await this.dataSource.query(
      `
          DELETE
          FROM security
          WHERE "deviceId" = $1
      `,
      [deviceId],
    );
  }

  async findUserSessionByDeviceId(
    deviceId: DeviceId,
  ): Promise<Security | null> {
    const session = await this.dataSource.query(
      `
          SELECT *
          FROM security
          WHERE "deviceId" = $1
      `,
      [deviceId],
    );

    return session.length ? Security.restoreSessionFromDB(session[0]) : null;
  }

  async createSession(session: Security): Promise<void> {
    await this.dataSource.query(
      `
          INSERT INTO security("deviceId", "userId", "deviceName", ip, "lastActiveDate", "expireAt")
          VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [
        session.deviceId, // $1
        session.userId, // $2
        session.deviceName, // $3
        session.ip, // $4
        session.lastActiveDate, // $5
        session.expireAt, // $6
      ],
    );
  }

  async updateSession(session: Security): Promise<void> {
    await this.dataSource.query(
      `
          UPDATE security
          SET "lastActiveDate" = $1,
              "expireAt"       = $2,
              ip               = $3
          WHERE "deviceId" = $4
      `,
      [
        session.lastActiveDate, // $1
        session.expireAt, // $2
        session.ip, // $3
        session.deviceId, // $4
      ],
    );
  }
}

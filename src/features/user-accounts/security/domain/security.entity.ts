import { CreateSessionDTO, UpdateSessionDTO } from './dto/security.dto';

type SessionRowDataFromDB = {
  deviceId: string;
  userId: string;
  deviceName: string;
  ip: string;
  lastActiveDate: Date;
  expireAt: Date;
};

export class Security {
  deviceId: string;

  userId: string;

  deviceName: string;

  ip: string;

  lastActiveDate: Date;

  expireAt: Date;

  static createSession(dto: CreateSessionDTO): Security {
    const session = new this();

    session.deviceId = dto.deviceId;
    session.userId = dto.userId;
    session.deviceName = dto.deviceName;
    session.ip = dto.ip;
    session.lastActiveDate = new Date(dto.lastActiveDate);
    session.expireAt = new Date(dto.expireAt);

    return session;
  }

  static restoreSessionFromDB(dto: SessionRowDataFromDB): Security {
    const session = new this();

    session.deviceId = dto.deviceId;
    session.userId = dto.userId;
    session.deviceName = dto.deviceName;
    session.ip = dto.ip;
    session.lastActiveDate = dto.lastActiveDate;
    session.expireAt = dto.expireAt;

    return session;
  }

  updateSession(dto: UpdateSessionDTO): void {
    this.lastActiveDate = new Date(dto.lastActiveDate);
    this.expireAt = new Date(dto.expireAt);
  }
}

// export const SecuritySchema = SchemaFactory.createForClass(Security);
//
// SecuritySchema.loadClass(Security);
//
// export type SecurityDocument = HydratedDocument<Security>;
//
// export type SecurityModelType = Model<SecurityDocument> & typeof Security;

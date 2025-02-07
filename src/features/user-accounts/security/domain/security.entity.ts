import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { CreateSessionDTO, UpdateSessionDTO } from './dto/security.dto';
import { ObjectId } from 'mongodb';

@Schema()
export class Security {
  @Prop({ type: Types.ObjectId, required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, required: true })
  deviceId: string;

  @Prop({ type: String, required: true })
  deviceName: string;

  @Prop({ type: String, required: true })
  ip: string;

  @Prop({ type: Date, required: true })
  lastActiveDate: Date;

  @Prop({ type: Date, required: true })
  expireAt: Date;

  static createSession(dto: CreateSessionDTO): SecurityDocument {
    const session = new this();

    session.userId = new ObjectId(dto.userId);
    session.deviceId = dto.deviceId;
    session.deviceName = dto.deviceName;
    session.ip = dto.ip;
    session.lastActiveDate = new Date(dto.lastActiveDate);
    session.expireAt = new Date(dto.expireAt);

    return session as SecurityDocument;
  }

  updateSession(dto: UpdateSessionDTO): void {
    this.lastActiveDate = new Date(dto.lastActiveDate);
    this.expireAt = new Date(dto.expireAt);
  }
}

export const SecuritySchema = SchemaFactory.createForClass(Security);

SecuritySchema.loadClass(Security);

export type SecurityDocument = HydratedDocument<Security>;

export type SecurityModelType = Model<SecurityDocument> & typeof Security;

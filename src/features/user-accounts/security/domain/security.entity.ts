import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { UserDocument } from '../../users/domain/user.entity';

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

  @Prop({ type: Number, required: true })
  iat_ms: number;

  @Prop({ type: Number, required: true })
  exp: number;
}

export const SecuritySchema = SchemaFactory.createForClass(Security);

SecuritySchema.loadClass(Security);

export type SecurityDocument = HydratedDocument<Security>;

export type SecurityModelType = Model<UserDocument> & typeof Security;

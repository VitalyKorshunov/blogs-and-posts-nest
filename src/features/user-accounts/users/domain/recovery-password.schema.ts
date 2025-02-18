import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';

@Schema({ _id: false, timestamps: true })
export class RecoveryPassword {
  @Prop({ type: Date, default: new Date() })
  expirationDate: Date;

  @Prop({ type: String, default: randomUUID })
  recoveryCode: string;
}

export const RecoveryPasswordSchema =
  SchemaFactory.createForClass(RecoveryPassword);

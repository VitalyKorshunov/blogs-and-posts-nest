import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema({ _id: false, timestamps: true })
export class RecoveryPassword {
  @Prop({ type: Date, default: new Date() })
  expirationDate: Date;

  @Prop({ type: String, default: uuidv4 })
  recoveryCode: string;
}

export const RecoveryPasswordSchema =
  SchemaFactory.createForClass(RecoveryPassword);

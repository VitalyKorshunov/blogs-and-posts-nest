import { add } from 'date-fns';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  RecoveryPassword,
  RecoveryPasswordSchema,
} from './recovery-password.schema';
import {
  EmailConfirmation,
  EmailConfirmationSchema,
} from './email-confirmation.schema';
import { CreateUserDTO, RecoveryPasswordUserDTO } from '../dto/user.dto';
import { HydratedDocument, Model } from 'mongoose';
import { DeletionStatus } from '../../../core/dto/deletion-statuses';
import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';

export const loginConstraints = {
  minLength: 3,
  maxLength: 10,
  match: /^[a-zA-Z0-9_-]*$/,
};

export const passwordConstraints = {
  minLength: 6,
  maxLength: 20,
};

export const emailConstraints = {
  match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
};

@Schema({ timestamps: true })
export class User {
  @Prop({
    type: String,
    required: true,
    unique: true,
    ...loginConstraints,
  })
  login: string;

  @Prop({ type: String, required: true, unique: true })
  email: string;

  @Prop({ type: String, required: true })
  passHash: string;

  @Prop({ type: RecoveryPasswordSchema })
  recoveryPassword: RecoveryPassword;

  @Prop({ type: EmailConfirmationSchema, required: true })
  emailConfirmation: EmailConfirmation;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ enum: DeletionStatus, default: DeletionStatus.NotDeleted })
  deletionStatus: DeletionStatus;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  static createUser(dto: CreateUserDTO): UserDocument {
    const user = new this();
    user.login = dto.login;
    user.email = dto.email;
    user.passHash = dto.passwordHash;
    user.emailConfirmation = {
      expirationDate: add(new Date(), { minutes: 10 }),
      confirmationCode: randomUUID(),
      isConfirmed: false,
    };
    return user as UserDocument;
  }

  canBeConfirmed(): boolean {
    return (
      this.emailConfirmation.isConfirmed === false &&
      this.emailConfirmation.expirationDate > new Date()
    );
  }

  confirmEmail(confirmationCode: string): void {
    if (!this.canBeConfirmed())
      throw new Error(`email already confirmed or expired email code`);
    if (this.emailConfirmation.confirmationCode !== confirmationCode)
      throw new Error(`invalid email confirmation code`);

    this.emailConfirmation.isConfirmed = true;
    this.emailConfirmation.expirationDate = new Date();
  }

  isEmailConfirmed(): boolean {
    return this.emailConfirmation.isConfirmed;
  }

  changeEmailConfirmationCode(): void {
    if (this.isEmailConfirmed()) throw new Error('email already confirm');
    this.emailConfirmation.expirationDate = add(new Date(), {
      minutes: 10,
    });
    this.emailConfirmation.confirmationCode = randomUUID();
  }

  getEmailConfirmationCode(): string {
    return this.emailConfirmation.confirmationCode;
  }

  isPassRecoveryCodeExpired(): boolean {
    return this.recoveryPassword.expirationDate < new Date();
  }

  changePassRecoveryCode(): void {
    this.recoveryPassword.expirationDate = add(new Date(), { minutes: 5 });
    this.recoveryPassword.recoveryCode = randomUUID();
  }

  getPassRecoveryCode(): string {
    return this.recoveryPassword.recoveryCode;
  }

  changePasswordAfterRecovery(dto: RecoveryPasswordUserDTO): void {
    if (this.isPassRecoveryCodeExpired())
      throw new Error('recovery code is expired');
    if (this.recoveryPassword.recoveryCode !== dto.recoveryCode)
      throw new Error('invalid password recovery code');

    this.passHash = dto.newPassHash;
    this.recoveryPassword.expirationDate = new Date();
  }

  getPassHash(): string {
    return this.passHash;
  }

  permanentDelete(): void {
    if (this.deletionStatus === DeletionStatus.PermanentDeleted)
      throw new BadRequestException('user already deleted');

    this.deletionStatus = DeletionStatus.PermanentDeleted;
    this.deletedAt = new Date();
  }

  // getId(): UserId {
  //   return this._id.toString();
  // }
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.loadClass(User);

export type UserDocument = HydratedDocument<User>;

export type UserModelType = Model<UserDocument> & typeof User;

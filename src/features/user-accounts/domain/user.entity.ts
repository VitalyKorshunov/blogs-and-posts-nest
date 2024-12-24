import { add } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  RecoveryPassword,
  RecoveryPasswordSchema,
} from './recovery-password.schema';
import {
  EmailConfirmation,
  EmailConfirmationSchema,
} from './email-confirmation.schema';
import { CreateUserDTO, RecoveryPassUserDTO } from '../dto/user.dto';
import { HydratedDocument, Model } from 'mongoose';
import { DeletionStatus } from '../../../core/dto/deletion-statuses';
import { BadRequestException } from '@nestjs/common';

@Schema({ timestamps: true })
export class User {
  @Prop({
    type: String,
    required: true,
    minlength: 3,
    maxlength: 10,
    unique: true,
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

  @Prop({ enum: DeletionStatus, default: DeletionStatus.NotDeleted })
  deletionStatus: DeletionStatus;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  static createUser(dto: CreateUserDTO): UserDocument {
    const user = new this();
    user.login = dto.login;
    user.email = dto.email;
    user.passHash = dto.password;
    user.emailConfirmation = {
      expirationDate: add(new Date(), { minutes: 10 }),
      confirmationCode: uuidv4(),
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
    this.emailConfirmation.confirmationCode = uuidv4();
  }

  getEmailConfirmationCode(): string {
    return this.emailConfirmation.confirmationCode;
  }

  isPassRecoveryCodeExpired(): boolean {
    return this.recoveryPassword.expirationDate < new Date();
  }

  changePassRecoveryCode() {
    this.recoveryPassword.expirationDate = add(new Date(), { minutes: 5 });
    this.recoveryPassword.recoveryCode = uuidv4();
  }

  getPassRecoveryCode(): string {
    return this.recoveryPassword.recoveryCode;
  }

  changePassHash(dto: RecoveryPassUserDTO): void {
    if (this.isPassRecoveryCodeExpired())
      throw new Error('recovery code is expired');
    if (this.recoveryPassword.recoveryCode !== dto.passRecoveryCode)
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

  // getId(): string {
  //   return this.id;
  // }
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.loadClass(User);

export type UserDocument = HydratedDocument<User>;

export type UserModelType = Model<UserDocument> & typeof User;

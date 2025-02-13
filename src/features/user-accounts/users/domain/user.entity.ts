import { add } from 'date-fns';
import { RecoveryPassword } from './recovery-password.schema';
import { EmailConfirmation } from './email-confirmation.schema';
import { CreateUserDTO, RecoveryPasswordUserDTO } from './dto/user.dto';
import { DeletionStatus } from '../../../../core/dto/deletion-status';
import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';

export const userLoginConstraints = {
  minLength: 3,
  maxLength: 10,
  match: /^[a-zA-Z0-9_-]*$/,
};

export const userPasswordConstraints = {
  minLength: 6,
  maxLength: 20,
};

export const userEmailConstraints = {
  match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
};

export class User {
  id: string;

  login: string;

  email: string;

  passHash: string;

  recoveryPassword: RecoveryPassword;

  emailConfirmation: EmailConfirmation;

  createdAt: Date;

  updatedAt: Date;

  deletionStatus: DeletionStatus;

  deletedAt: Date | null;

  static createUser(
    dto: CreateUserDTO,
    emailConfirmationCodeLifetimeInHours: number,
  ): User {
    const user = new this();
    user.login = dto.login;
    user.email = dto.email;
    user.passHash = dto.passwordHash;
    user.recoveryPassword = {
      expirationDate: new Date(),
      recoveryCode: randomUUID(),
    };
    user.emailConfirmation = {
      expirationDate: add(new Date(), {
        hours: emailConfirmationCodeLifetimeInHours,
      }),
      confirmationCode: randomUUID(),
      isConfirmed: false,
    };
    user.deletionStatus = DeletionStatus.NotDeleted;
    user.deletedAt = null;
    user.createdAt = new Date();
    user.updatedAt = new Date();

    return user;
  }

  static restoreUserFromDB(data: User): User {
    const user = new this();
    Object.assign(user, data);
    return user;
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

  changePassRecoveryCode(passwordRecoveryCodeLifetimeInHours: number): void {
    this.recoveryPassword.expirationDate = add(new Date(), {
      hours: passwordRecoveryCodeLifetimeInHours,
    });
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

// export const UserSchema = SchemaFactory.createForClass(User);

// UserSchema.loadClass(User);

// export type UserDocument = HydratedDocument<User>;
//
// export type UserModelType = Model<UserDocument> & typeof User;

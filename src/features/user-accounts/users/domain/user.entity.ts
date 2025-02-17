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

type UserRowDataFromDb = {
  id: string;
  login: string;
  email: string;
  passHash: string;
  deletionStatus: DeletionStatus;
  deletedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  expirationPassDate: Date;
  recoveryCode: string;
  expirationEmailDate: Date;
  confirmationCode: string;
  isConfirmed: boolean;
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
      expirationPassDate: new Date(),
      recoveryCode: randomUUID(),
    };
    user.emailConfirmation = {
      expirationEmailDate: add(new Date(), {
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

  static restoreUserFromDB(data: UserRowDataFromDb): User {
    const user = new this();
    user.id = data.id;
    user.login = data.login;
    user.email = data.email;
    user.passHash = data.passHash;
    user.recoveryPassword = {
      expirationPassDate: data.expirationPassDate,
      recoveryCode: data.recoveryCode,
    };
    user.emailConfirmation = {
      expirationEmailDate: data.expirationEmailDate,
      confirmationCode: data.confirmationCode,
      isConfirmed: data.isConfirmed,
    };
    user.createdAt = data.createdAt;
    user.updatedAt = data.updatedAt;
    user.deletionStatus = data.deletionStatus;
    user.deletedAt = data.deletedAt;
    return user;
  }

  canBeConfirmed(): boolean {
    return (
      this.emailConfirmation.isConfirmed === false &&
      this.emailConfirmation.expirationEmailDate > new Date()
    );
  }

  confirmEmail(confirmationCode: string): void {
    if (!this.canBeConfirmed())
      throw new Error(`email already confirmed or expired email code`);
    if (this.emailConfirmation.confirmationCode !== confirmationCode)
      throw new Error(`invalid email confirmation code`);

    this.emailConfirmation.isConfirmed = true;
    this.emailConfirmation.expirationEmailDate = new Date();

    this.updatedAt = new Date();
  }

  isEmailConfirmed(): boolean {
    return this.emailConfirmation.isConfirmed;
  }

  changeEmailConfirmationCode(
    emailConfirmationCodeLifetimeInHours: number,
  ): void {
    if (this.isEmailConfirmed()) throw new Error('email already confirm');
    this.emailConfirmation.expirationEmailDate = add(new Date(), {
      minutes: emailConfirmationCodeLifetimeInHours,
    });
    this.emailConfirmation.confirmationCode = randomUUID();

    this.updatedAt = new Date();
  }

  getEmailConfirmationCode(): string {
    return this.emailConfirmation.confirmationCode;
  }

  isPassRecoveryCodeExpired(): boolean {
    return this.recoveryPassword.expirationPassDate < new Date();
  }

  changePassRecoveryCode(passwordRecoveryCodeLifetimeInHours: number): void {
    this.recoveryPassword.expirationPassDate = add(new Date(), {
      hours: passwordRecoveryCodeLifetimeInHours,
    });
    this.recoveryPassword.recoveryCode = randomUUID();

    this.updatedAt = new Date();
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
    this.recoveryPassword.expirationPassDate = new Date();

    this.updatedAt = new Date();
  }

  getPassHash(): string {
    return this.passHash;
  }

  permanentDelete(): void {
    if (this.deletionStatus === DeletionStatus.PermanentDeleted)
      throw new BadRequestException('user already deleted');

    this.deletionStatus = DeletionStatus.PermanentDeleted;
    this.deletedAt = new Date();

    this.updatedAt = new Date();
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

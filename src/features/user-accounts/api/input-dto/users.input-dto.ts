import { IsEmail, IsString, IsUUID, Length, Matches } from 'class-validator';
import {
  loginConstraints,
  passwordConstraints,
} from '../../domain/user.entity';

export class CreateUserInputDTO {
  @IsString()
  @Matches(`^[a-zA-Z0-9_-]*$`) //TODO: исправить на переменную loginConstraints.match
  @Length(loginConstraints.minLength, loginConstraints.maxLength)
  login: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(passwordConstraints.minLength, passwordConstraints.maxLength)
  password: string;
}

export class LoginInputDTO {
  @IsString()
  loginOrEmail: string;

  @IsString()
  @Length(passwordConstraints.minLength, passwordConstraints.maxLength)
  password: string;
}

export class ConfirmationCodeInputDTO {
  @IsString()
  @IsUUID()
  code: string;
}

export class EmailResendingInputDTO {
  @IsEmail()
  email: string;
}

export class PasswordRecoveryInputDTO {
  @IsEmail()
  email: string;
}

export class NewPasswordInputDTO {
  @IsString()
  @Length(passwordConstraints.minLength, passwordConstraints.maxLength)
  newPassword: string;

  @IsString()
  @IsUUID()
  recoveryCode: string;
}

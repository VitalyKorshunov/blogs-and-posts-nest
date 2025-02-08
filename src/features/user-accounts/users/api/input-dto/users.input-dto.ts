import { IsString, IsUUID, Length, Matches } from 'class-validator';
import {
  userEmailConstraints,
  userLoginConstraints,
  userPasswordConstraints,
} from '../../domain/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Trim } from '../../../../../core/decorators/transform/trim';

class UserEmailDTO {
  @ApiProperty({
    example: 'email@example.com',
    pattern: userEmailConstraints.match.source,
  })
  @Matches(userEmailConstraints.match.source)
  @Trim()
  @IsString()
  email: string;
}

export class CreateUserInputDTO extends UserEmailDTO {
  @ApiProperty({
    pattern: userLoginConstraints.match.source,
    minLength: userLoginConstraints.minLength,
    maxLength: userLoginConstraints.maxLength,
  })
  @Length(userLoginConstraints.minLength, userLoginConstraints.maxLength)
  @Matches(userLoginConstraints.match)
  @Trim()
  login: string;

  @ApiProperty({
    example: 'email@example.com',
    pattern: userEmailConstraints.match.source,
  })
  @Matches(userEmailConstraints.match.source)
  @Trim()
  @IsString()
  email: string;

  @IsString()
  @Length(userPasswordConstraints.minLength, userPasswordConstraints.maxLength)
  password: string;
}

export class LoginInputDTO {
  @IsString()
  loginOrEmail: string;

  @Length(userPasswordConstraints.minLength, userPasswordConstraints.maxLength)
  @IsString()
  password: string;
}

export class ConfirmationCodeInputDTO {
  @IsString()
  @IsUUID()
  code: string;
}

export class EmailResendingInputDTO {
  @ApiProperty({
    example: 'email@example.com',
    pattern: userEmailConstraints.match.source,
  })
  @Matches(userEmailConstraints.match.source)
  @Trim()
  @IsString()
  email: string;
}

export class PasswordRecoveryInputDTO {
  @ApiProperty({
    example: 'email@example.com',
    pattern: userEmailConstraints.match.source,
  })
  @Matches(userEmailConstraints.match.source)
  @Trim()
  @IsString()
  email: string;
}

export class ChangeUserPasswordInputDTO {
  @Length(userPasswordConstraints.minLength, userPasswordConstraints.maxLength)
  @Trim()
  @IsString()
  newPassword: string;

  @IsUUID()
  @Trim()
  @IsString()
  recoveryCode: string;
}

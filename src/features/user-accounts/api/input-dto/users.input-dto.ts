import { CreateUserDTO } from '../../dto/user.dto';
import { IsEmail, IsString, Length, Matches } from 'class-validator';
import {
  loginConstraints,
  passwordConstraints,
} from '../../domain/user.entity';

export class CreateUserInputDTO implements CreateUserDTO {
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

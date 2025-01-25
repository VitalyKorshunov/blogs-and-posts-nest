import { CreateUserDTO } from '../../dto/user.dto';
import { IsEmail, Length } from 'class-validator';

export class CreateUserInputDTO implements CreateUserDTO {
  @Length(5, 10)
  login: string;
  @IsEmail()
  email: string;
  password: string;
}

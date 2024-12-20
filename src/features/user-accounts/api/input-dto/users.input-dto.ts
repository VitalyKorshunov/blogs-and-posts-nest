import { CreateUserDTO } from '../../dto/user.dto';

export class CreateUserInputDTO implements CreateUserDTO {
  login: string;
  email: string;
  password: string;
}

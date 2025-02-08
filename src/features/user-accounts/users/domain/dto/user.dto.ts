export class CreateUserDTO {
  login: string;
  email: string;
  passwordHash: string;
}

export class RecoveryPasswordUserDTO {
  recoveryCode: string;
  newPassHash: string;
}

export type UserId = string;

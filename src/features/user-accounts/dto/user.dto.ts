export class CreateUserDTO {
  login: string;
  email: string;
  password: string;
}

export class RecoveryPassUserDTO {
  passRecoveryCode: string;
  newPassHash: string;
}

export type UserId = string;

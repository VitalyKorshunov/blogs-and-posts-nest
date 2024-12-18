export class CreateUserDTO {
  login: string;
  email: string;
  passHash: string;
}

export class RecoveryPassUserDTO {
  passRecoveryCode: string;
  newPassHash: string;
}

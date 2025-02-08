export class AccessTokenPayloadDTO {
  userId: string;
  lastActiveDate: string;
  exp: number;
}

export class RefreshTokenPayloadDTO {
  userId: string;
  deviceId: string;
  lastActiveDate: string;
  exp: number;
}

export class AccessAndRefreshTokensDTO {
  accessToken: string;
  refreshToken: string;
}
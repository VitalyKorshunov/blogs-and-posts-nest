export class AccessTokenPayloadDTO {
  userId: string;
  createdAt: number;
  exp: number;
}

export class RefreshTokenPayloadDTO {
  userId: string;
  deviceId: string;
  createdAt: number;
  exp: number;
}

export class AccessAndRefreshTokensDTO {
  accessToken: string;
  refreshToken: string;
}

export type DeviceId = string;

export class CreateSessionDTO {
  userId: string;
  deviceId: string;
  deviceName: string;
  ip: string;
  lastActiveDate: string;
  expireAt: string;
}

export class UpdateSessionDTO {
  lastActiveDate: string;
  expireAt: string;
}

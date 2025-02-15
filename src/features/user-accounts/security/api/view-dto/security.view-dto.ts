import { Security } from '../../domain/security.entity';

export class SecurityViewDTO {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;

  static mapToView(security: Security): SecurityViewDTO {
    const dto = new SecurityViewDTO();

    dto.ip = security.ip;
    dto.title = security.deviceName;
    dto.lastActiveDate = security.lastActiveDate.toISOString();
    dto.deviceId = security.deviceId;

    return dto;
  }
}

import bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CryptoService {
  async generateHash(password: string): Promise<string> {
    return await bcrypt.hash(password, 12);
  }

  async compareHash(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';

interface IDecodedToken {
  id: string;
  did: string;
  verifiedRoles: { name: string; namespace: string }[];
  iat: number;
  exp: number;
}

const KEY_PREFIX = 'refresh-token';

@Injectable()
export class RefreshTokenRepository {
  private readonly logger = new Logger(RefreshTokenRepository.name, {
    timestamp: true,
  });

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private redis: RedisService,
  ) {}

  async saveToken(token: string): Promise<void> {
    const decoded = this.jwtService.verify(token) as IDecodedToken;
    const ttl = decoded.exp - Math.floor(Date.now() / 1000);
    const key = redisKey(KEY_PREFIX, decoded.did, decoded.id);

    this.logger.debug(`saving key: ${key}`);
    await this.redis.set(key, JSON.stringify(decoded), 'EX', ttl);
  }

  async getToken(did: string, id: string): Promise<string | null> {
    const key = redisKey(KEY_PREFIX, did, id);
    this.logger.debug(`getting key: ${key}`);
    const value = this.redis.get(key);
    if (!value) {
      this.logger.warn(`no value for key: ${key}`);
      return null;
    }
    return value;
  }

  async deleteToken(did: string, id: string): Promise<void> {
    const key = redisKey(KEY_PREFIX, did, id);
    this.logger.debug(`deleting key: ${key}`);
    await this.redis.del(key);
  }
}

function redisKey(prefix, did, id) {
  return `${prefix}:${did}:${id}`;
}

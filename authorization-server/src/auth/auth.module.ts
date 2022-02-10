import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthStrategy } from './auth.strategy';
import { JwtStrategy } from './jwt.strategy';
import { RedisModule } from '../redis/redis.module';
import { RefreshTokenRepository } from './refresh-token.repository';

@Module({
  imports: [RedisModule],
  controllers: [AuthController],
  providers: [AuthService, AuthStrategy, JwtStrategy, RefreshTokenRepository],
})
export class AuthModule {}

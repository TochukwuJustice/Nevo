import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import type { StringValue } from 'ms';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { StellarAuthGuard } from './stellar-auth.guard';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'dev-secret',
      signOptions: {
        expiresIn: (process.env.JWT_EXPIRY ?? '7d') as StringValue,
      },
    }),
    UsersModule,
  ],
  providers: [AuthService, JwtStrategy, StellarAuthGuard],
  controllers: [AuthController],
  exports: [StellarAuthGuard],
})
export class AuthModule {}

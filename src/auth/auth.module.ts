import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { StorefrontAuthController } from './controllers/storefront-auth.controller';
import { AdminAuthController } from './controllers/admin-auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { StorefrontAuthGuard } from './guards/storefront-auth.guard';
import { AdminAuthGuard } from './guards/admin-auth.guard';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_EXPIRES_IN', '15m') },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy, LocalStrategy, JwtAuthGuard, RolesGuard, StorefrontAuthGuard, AdminAuthGuard],
  controllers: [AuthController, StorefrontAuthController, AdminAuthController],
  exports: [AuthService, JwtAuthGuard, RolesGuard, StorefrontAuthGuard, AdminAuthGuard],
})
export class AuthModule {}
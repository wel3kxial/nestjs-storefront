import { Injectable, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from '@prisma/client';

@Injectable()
export class StorefrontAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      throw err || new ForbiddenException('Authentication required');
    }

    if (user.role !== UserRole.CUSTOMER) {
      throw new ForbiddenException('Access denied. Customer account required.');
    }

    return user;
  }
}
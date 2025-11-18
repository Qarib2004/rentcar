import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

interface RequestWithUser {
  user?: JwtPayload;
}

export const CurrentUser = createParamDecorator(
  (
    data: string | undefined,
    ctx: ExecutionContext,
  ): JwtPayload | string | undefined => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      return undefined;
    }

    if (data) {
      const value = user[data as keyof JwtPayload];
      return typeof value === 'string' ? value : undefined;
    }

    return user;
  },
);

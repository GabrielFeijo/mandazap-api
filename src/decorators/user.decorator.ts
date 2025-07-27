import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User as PrismaUser } from '@prisma/client';

export const User = createParamDecorator((_, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<{ user: PrismaUser }>();
  return request.user;
});

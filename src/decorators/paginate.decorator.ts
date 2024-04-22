import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Paginate = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const { page = 1, limit = 10 } = request.query;
    return {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    };
  },
);

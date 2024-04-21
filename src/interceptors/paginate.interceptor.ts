// paginate.interceptor.ts
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class PaginateInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { page = 1, limit = 10 } = request.query;
    request.pagination = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    };
    return next.handle().pipe(
      map((data) => ({
        ...data,
      })),
    );
  }
}

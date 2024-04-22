import { ArgumentsHost, Catch } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { ThrottlerException } from '@nestjs/throttler';

@Catch(ThrottlerException)
export class ThrottlerFilter extends BaseExceptionFilter {
  catch(exception: ThrottlerException, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse();
    const status = exception.getStatus();

    // Customize the response message here
    const message = 'Too Many Requests';

    response.status(status).json({
      status: status,
      message: message,
      data: null,
    });
  }
}

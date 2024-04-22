import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

import * as fs from 'fs';
import {
  CustomHttpExceptionResponse,
  HttpExceptionResponse,
} from 'src/types/global.types';

// error handeler for all error in application
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: HttpException | Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: HttpStatus;
    let errorMessage: string;

    // handel all http error
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse();
      errorMessage =
        (errorResponse as HttpExceptionResponse).error || exception.message;
    } else if (exception instanceof Error) {
      // handel throw new Error

      status = HttpStatus.INTERNAL_SERVER_ERROR;
      errorMessage = exception.message;
    } else {
      // handel other error
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      errorMessage = 'Critical internal server error occurred!';
    }

    const errorResponse = this.getErrorResponse(status, errorMessage, request);

    // handel error message
    const messageErrType =
      exception instanceof HttpException &&
      exception.getStatus() === HttpStatus.TOO_MANY_REQUESTS
        ? exception.message
        : exception instanceof HttpException
          ? exception.getResponse()['message']
          : errorMessage;

    const messageErr = Array.isArray(messageErrType)
      ? messageErrType[0]
      : messageErrType;

    const errorLog = this.getErrorLog(errorResponse, request, exception);
    this.writeErrorLogToFile(errorLog);
    response.status(status).json({
      status: errorResponse.statusCode,
      message: messageErr,
      stack: exception.stack,
      data: null,
    });
  }
  private extractValidationErrors(validationError: any): string {
    // Extract the error messages from class-validator validation errors
    if (Array.isArray(validationError)) {
      return validationError
        .map((error) => Object.values(error.constraints).join(', '))
        .join(', ');
    }
    return validationError;
  }
  private getErrorResponse = (
    status: HttpStatus,
    errorMessage: string,
    request: Request,
  ): CustomHttpExceptionResponse => ({
    statusCode: status,
    error: errorMessage,
    path: request.url,
    method: request.method,
    timeStamp: new Date(),
  });

  private getErrorLog = (
    errorResponse: CustomHttpExceptionResponse,
    request: Request,
    exception: unknown,
  ): string => {
    const { statusCode, error } = errorResponse;
    const { method, url } = request;
    const errorLog = `Response Code: ${statusCode} - Method: ${method} - URL: ${url}\n\n
        ${JSON.stringify(errorResponse)}\n\n
        ${exception instanceof HttpException ? exception.stack : error}\n\n`;
    return errorLog;
  };

  private writeErrorLogToFile = (errorLog: string): void => {
    fs.appendFile('error.log', errorLog, 'utf8', (err) => {
      if (err) throw err;
    });
  };
}

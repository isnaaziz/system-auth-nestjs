import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string;
    let details: any;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        message = (exceptionResponse as any).message || exception.message;
        details = (exceptionResponse as any).details;
      } else {
        message = exception.message;
      }
    } else if (exception instanceof QueryFailedError) {
      status = HttpStatus.BAD_REQUEST;
      message = this.handleDatabaseError(exception);
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      this.logger.error(exception.message, exception.stack);
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      this.logger.error('Unknown exception', exception);
    }

    const errorResponse = {
      statusCode: status,
      message,
      details,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    // Log error for monitoring
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url}`,
        JSON.stringify(errorResponse),
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url}`,
        JSON.stringify(errorResponse),
      );
    }

    response.status(status).json(errorResponse);
  }

  private handleDatabaseError(error: QueryFailedError): string {
    const message = error.message;

    // MySQL specific error handling
    if (message.includes('Duplicate entry')) {
      if (message.includes('username')) {
        return 'Username already exists';
      }
      if (message.includes('email')) {
        return 'Email already exists';
      }
      return 'Duplicate entry found';
    }

    if (message.includes('Data too long')) {
      return 'Input data exceeds maximum length';
    }

    if (message.includes('cannot be null')) {
      return 'Required field is missing';
    }

    if (message.includes('foreign key constraint')) {
      return 'Referenced record does not exist';
    }

    return 'Database operation failed';
  }
}

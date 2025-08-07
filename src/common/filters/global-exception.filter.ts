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
    const code = (error as any).code;

    // PostgreSQL specific error handling
    if (code === '23505') { // unique_violation
      if (message.includes('username')) {
        return 'Username already exists';
      }
      if (message.includes('email')) {
        return 'Email already exists';
      }
      return 'Duplicate entry found';
    }

    if (code === '23502') { // not_null_violation
      return 'Required field is missing';
    }

    if (code === '23503') { // foreign_key_violation
      return 'Referenced record does not exist';
    }

    if (code === '22001') { // string_data_right_truncation
      return 'Input data exceeds maximum length';
    }

    if (code === '22P02') { // invalid_text_representation
      return 'Invalid data format';
    }

    if (code === '42703') { // undefined_column
      return 'Database column error';
    }

    if (message.includes('duplicate key')) {
      return 'Duplicate entry found';
    }

    if (message.includes('violates not-null constraint')) {
      return 'Required field is missing';
    }

    if (message.includes('violates foreign key constraint')) {
      return 'Referenced record does not exist';
    }

    return 'Database operation failed';
  }
}

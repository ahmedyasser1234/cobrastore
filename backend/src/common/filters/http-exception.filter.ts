import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError, EntityNotFoundError } from 'typeorm';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let errorType = 'InternalServerError';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res: any = exception.getResponse();
      message = res.message || res;
      errorType = res.error || 'HttpException';
    } else if (exception instanceof QueryFailedError) {
      // Handle Database Errors
      status = HttpStatus.CONFLICT;
      message = exception.message + ((exception as any).driverError?.detail ? ` - Detail: ${(exception as any).driverError.detail}` : '');
      errorType = 'DatabaseConflict';
    } else if (exception instanceof EntityNotFoundError) {
      status = HttpStatus.NOT_FOUND;
      message = 'Requested resource not found';
      errorType = 'NotFound';
    } else {
      // General error
      this.logger.error(`Unhandled Exception: ${exception}`);
    }

    if (exception instanceof QueryFailedError) {
       this.logger.error(`QueryFailedError details: table=${(exception as any).table}, constraint=${(exception as any).constraint}, detail=${(exception as any).driverError?.detail}`);
       message += ` | Table: ${(exception as any).table} | Constraint: ${(exception as any).constraint}`;
    }

    const errorResponse = {
      statusCode: status,
      error: errorType,
      message: Array.isArray(message) ? message[0] : message,
      details: Array.isArray(message) ? message : undefined,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }

  private formatDbError(message: string): string {
    if (message.includes('unique constraint')) {
      return 'A record with this information already exists.';
    }
    return 'Database operation failed.';
  }
}

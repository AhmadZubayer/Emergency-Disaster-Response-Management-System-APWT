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
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  private extractFileName(exception: unknown): string | null {
    if (!(exception instanceof Error) || !exception.stack) {
      return null;
    }
    const stackLines = exception.stack.split('\n');
    for (const line of stackLines) {
      if (line.includes('node_modules') || line.includes('node:internal')) {
        continue;
      }
      const match = line.match(/([a-zA-Z0-9_\-]+\.(?:ts|js):\d+(?::\d+)?)/);
      if (match) {
        return match[1];
      }
    }
    const fallbackMatch = exception.stack.match(
      /([a-zA-Z0-9_\-]+\.(?:ts|js):\d+(?::\d+)?)/,
    );
    return fallbackMatch ? fallbackMatch[1] : null;
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected internal server error occurred';
    let errorName = 'Internal Server Error';
    let details: any = null;

    const fileName = this.extractFileName(exception);

    // 1. Handle NestJS HttpExceptions
    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, any>;
        message = Array.isArray(resObj.message)
          ? resObj.message.join(', ')
          : resObj.message || exception.message;
        details = resObj.message || null;
      }
      errorName = exception.name;
    }
    // 2. Handle TypeORM QueryFailedError (Database errors)
    else if (exception instanceof QueryFailedError) {
      const driverError = (exception as any).driverError;
      const code = driverError?.code;

      if (code === '23505') {
        statusCode = HttpStatus.CONFLICT;
        message = 'A resource with duplicate unique constraint already exists';
        errorName = 'Duplicate Resource Conflict';
      } else if (code === '23503') {
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'Referenced entity constraint violation';
        errorName = 'Foreign Key Violation';
      } else {
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'Database operation failed';
        errorName = 'Database Error';
      }
      this.logger.error(`TypeORM Query Error [${code}]: ${exception.message}`);
    }
    // 3. Handle TypeORM EntityNotFoundError
    else if (exception instanceof EntityNotFoundError) {
      statusCode = HttpStatus.NOT_FOUND;
      message = 'Requested entity was not found in the database';
      errorName = 'Entity Not Found';
    }
    // 4. Handle Stripe API Errors
    else if (
      exception &&
      typeof exception === 'object' &&
      'type' in exception &&
      (exception as any).type?.startsWith('Stripe')
    ) {
      const stripeError = exception as any;
      statusCode = stripeError.statusCode || HttpStatus.BAD_REQUEST;
      message = stripeError.message || 'Payment processing error occurred';
      errorName = `StripeError (${stripeError.type})`;
      this.logger.error(`Stripe Error: ${stripeError.message}`);
    }
    // 5. Generic JavaScript Error
    else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(
        `Unhandled Exception: ${exception.message}`,
        exception.stack,
      );
    }

    if (statusCode >= 500) {
      this.logger.error(
        `HTTP ${statusCode} Error on ${request.method} ${request.url} [${fileName || 'unknown'}] - ${message}`,
      );
    } else {
      this.logger.warn(
        `HTTP ${statusCode} Warning on ${request.method} ${request.url} [${fileName || 'unknown'}] - ${message}`,
      );
    }

    response.status(statusCode).json({
      success: false,
      statusCode,
      message,
      error: errorName,
      ...(fileName ? { fileName } : {}),
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(details ? { details } : {}),
    });
  }
}

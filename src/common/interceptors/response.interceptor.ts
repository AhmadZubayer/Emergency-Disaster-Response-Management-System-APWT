import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RESPONSE_MESSAGE_KEY } from '../decorators/response-message.decorator';

export interface ResponseEnvelope<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ResponseEnvelope<T>>
{
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseEnvelope<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const statusCode = response.statusCode;

    const customMessage = this.reflector.getAllAndOverride<string>(
      RESPONSE_MESSAGE_KEY,
      [context.getHandler(), context.getClass()],
    );

    return next.handle().pipe(
      map((data) => {
        let message = customMessage || 'Operation completed successfully';
        let payload = data;

        if (data && typeof data === 'object' && 'message' in data) {
          message = customMessage || data.message;
          const { message: _, ...rest } = data;
          payload = Object.keys(rest).length > 0 ? rest : data;
        }

        const sanitizedPayload = this.sanitizeData(payload);

        return {
          success: true,
          statusCode,
          message,
          data: sanitizedPayload ?? null,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }

  private sanitizeData(data: any): any {
    if (Array.isArray(data)) {
      return data.map((item) => this.sanitizeData(item));
    }
    if (data !== null && typeof data === 'object' && !(data instanceof Date)) {
      const cleaned: any = {};
      for (const [key, value] of Object.entries(data)) {
        if (
          ['created_by', 'updated_by', 'deleted_by', 'deleted_at'].includes(key) &&
          (value === null || value === undefined)
        ) {
          continue;
        }
        cleaned[key] = this.sanitizeData(value);
      }
      return cleaned;
    }
    return data;
  }
}

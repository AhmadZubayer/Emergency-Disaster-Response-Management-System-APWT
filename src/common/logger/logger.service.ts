import { Injectable, ConsoleLogger, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class CustomLoggerService extends ConsoleLogger {
  logBusinessEvent(event: string, context?: string, metadata?: Record<string, any>) {
    const ctx = context || this.context || 'Application';
    const metaString = metadata ? ` | Metadata: ${JSON.stringify(metadata)}` : '';
    this.log(`[EVENT] ${event}${metaString}`, ctx);
  }

  logStartup(message: string, context?: string) {
    this.log(`[STARTUP] ${message}`, context || 'Bootstrap');
  }

  logWarning(message: string, context?: string) {
    this.warn(message, context || this.context);
  }

  logError(message: string, stack?: string, context?: string) {
    this.error(message, stack, context || this.context);
  }
}

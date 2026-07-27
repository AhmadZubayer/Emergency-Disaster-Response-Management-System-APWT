import { HttpException, HttpStatus } from '@nestjs/common';

export class BaseDomainException extends HttpException {
  constructor(
    message: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
    public readonly errorCode?: string,
  ) {
    super(
      {
        message,
        errorCode,
      },
      status,
    );
  }
}

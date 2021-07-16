import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware<Request, Response> {
  private logger = new Logger(LoggerMiddleware.name, { timestamp: true });

  use(req: Request, res: Response, next: NextFunction) {
    console.log();
    console.log();

    this.logger.log('-------- START HANDLING REQUEST --------');
    this.logger.log(req.headers);
    this.logger.log(req.body);

    next();
  }
}

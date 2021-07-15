import { Injectable, Logger, NestMiddleware } from '@nestjs/common';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger(LoggerMiddleware.name, { timestamp: true });

  use(req: any, res: any, next: () => void) {
    console.log();
    console.log();

    this.logger.log('-------- START HANDLING REQUEST --------');
    this.logger.log(req.headers);
    this.logger.log(req.body);

    next();
  }
}

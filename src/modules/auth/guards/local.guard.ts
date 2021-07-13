import { AuthGuard } from '@nestjs/passport';
import { BadRequestException, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

export class LocalGuard extends AuthGuard('local') {
  /**
   * Validate if email and password was provided
   * and call passport local strategy
   * @param context
   */
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const body = context.switchToHttp().getRequest().body;

    if (!body.email) {
      throw new BadRequestException('Email not provided');
    }

    if (!body.password) {
      throw new BadRequestException('Password not provided');
    }

    return super.canActivate(context);
  }
}

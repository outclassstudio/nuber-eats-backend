import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const getContext = GqlExecutionContext.create(context).getContext();
    const user = getContext['user'];
    if (!user) {
      return false;
    }
    return true;
  }
}

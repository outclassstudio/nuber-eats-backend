import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const AuthUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const getContext = GqlExecutionContext.create(context).getContext();
    const user = getContext['user'];
    return user;
  },
);

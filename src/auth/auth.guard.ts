import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from 'src/jwt/jwt.service';
import { UsersService } from 'src/users/users.service';
import { AllowedRoles } from './role.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
  ) {}
  async canActivate(context: ExecutionContext) {
    //metadata에 저장한 키로 reflector에서 불러오기
    const roles = this.reflector.get<AllowedRoles>(
      'roles',
      context.getHandler(),
    );
    if (!roles) {
      return true;
    }
    const getContext = GqlExecutionContext.create(context).getContext();
    const token = getContext.token;
    if (token) {
      const decoded = this.jwtService.verify(token.toString());
      console.log(token, decoded, decoded['id']);
      if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
        const { user } = await this.userService.findById(decoded['id']);
        // console.log('user확인', user);
        if (!user) {
          return false;
        }
        getContext['user'] = user;
        if (roles.includes('Any')) {
          return true;
        }
        return roles.includes(user.role);
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
}

import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { UsersService } from 'src/users/users.service';
import { JwtService } from './jwt.service';

//extends가 아닌 implements
// 미들웨어를 클래스로 만들 때, di등을 사용할 때
@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    if ('x-jwt' in req.headers) {
      const token = req.headers['x-jwt'];

      try {
        //token이 array를 취할수도 있기 때문에 string으로 변환
        const decoded = this.jwtService.verify(token.toString());
        if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
          const { user, ok } = await this.userService.findById(decoded['id']);
          if (ok) {
            req['user'] = user;
          }
        }
      } catch (error) {}
    }
    next();
  }
}

//미들웨어를 함수로 만들 때
// export function jwtMiddleware(req: Request, res: Response, next: NextFunction) {
//   console.log(req.headers);
//   next();
// }

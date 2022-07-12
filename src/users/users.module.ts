import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserResolver } from './users.resolver';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService, UserResolver],
  //모듈에서 export해야 injection해서 쓸 수 있다
  exports: [UsersService],
})
export class UsersModule {}

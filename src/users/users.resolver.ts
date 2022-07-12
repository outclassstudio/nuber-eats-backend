import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Resolver((of) => User)
export class UserResolver {
  constructor(private readonly userSerivce: UsersService) {}

  @Query((returns) => User)
  @UseGuards(AuthGuard)
  me(@AuthUser() authUser: User) {
    return authUser;
  }

  @Mutation((returns) => CreateAccountOutput)
  async createAccount(
    @Args('input') createAccountInput: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    try {
      //service에서 처리 결과를 받아서
      const { ok, error } = await this.userSerivce.createAccount(
        createAccountInput,
      );
      //각각의 값을 리턴한다.
      return {
        ok,
        error,
      };
    } catch (error) {
      return {
        error,
        ok: false,
      };
    }
  }

  @Mutation((returns) => LoginOutput)
  async login(@Args('input') loginInput: LoginInput): Promise<LoginOutput> {
    try {
      const { ok, error, token } = await this.userSerivce.login(loginInput);
      return { ok, error, token };
    } catch (error) {
      return { ok: false, error };
    }
  }
}

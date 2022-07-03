import { Resolver, Query, Args } from '@nestjs/graphql';
import { Restaurant } from './entities/restaurant.entity';

//임포트 된 경로 잘 확인하기
@Resolver((of) => Restaurant)
export class RestaurantResolver {
  @Query((retunrs) => [Restaurant])
  restaurants(@Args('veganOnly') veganOnly: boolean): Restaurant[] {
    return [];
  }
}

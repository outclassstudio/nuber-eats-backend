import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { createRestaurantDto } from './dtos/create-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';

//임포트 된 경로 잘 확인하기
//entity상에 정의된 필드들을 갖는 Resolver
@Resolver((of) => Restaurant)
export class RestaurantResolver {
  @Query((retunrs) => [Restaurant])
  restaurants(@Args('veganOnly') veganOnly: boolean): Restaurant[] {
    return [];
  }

  @Mutation((returns) => Boolean)
  createRestaurant(@Args() createRestaurantDto: createRestaurantDto): boolean {
    console.log(createRestaurantDto);
    return true;
  }
}

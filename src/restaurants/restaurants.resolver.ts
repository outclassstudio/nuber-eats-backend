import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { User } from 'src/users/entities/user.entity';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantsService } from './restaurants.service';

//임포트 된 경로 잘 확인하기
//entity상에 정의된 필드들을 갖는 Resolver
@Resolver((of) => Restaurant)
export class RestaurantsResolver {
  constructor(private readonly restaurantService: RestaurantsService) {}

  @Mutation((returns) => CreateRestaurantOutput)
  createRestaurant(
    @AuthUser() authUser: User,
    @Args('input') createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    return this.restaurantService.createRestaurant(
      authUser,
      createRestaurantInput,
    );
  }
}

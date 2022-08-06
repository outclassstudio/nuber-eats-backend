import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Dish } from './entities/dish.entity';
import { Restaurant } from './entities/restaurant.entity';
import {
  CategoryResolover,
  DishResolver,
  RestaurantsResolver,
} from './restaurants.resolver';
import { RestaurantsService } from './restaurants.service';

@Module({
  //레포지토리를 임포트한다
  //엔티티를 임포트해서 쓴다
  imports: [TypeOrmModule.forFeature([Restaurant, Category, Dish])],
  providers: [
    RestaurantsResolver,
    RestaurantsService,
    CategoryResolover,
    DishResolver,
  ],
})
export class RestaurantsModule {}

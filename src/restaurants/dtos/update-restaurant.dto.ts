import { ArgsType, Field, InputType, PartialType } from '@nestjs/graphql';
import { createRestaurantDto } from './create-restaurant.dto';

//argument생성
@InputType()
export class updateRestaurantInputType extends PartialType(
  createRestaurantDto,
) {}

@InputType()
export class updateRestaurantDto {
  @Field((type) => Number)
  id: number;

  @Field((type) => updateRestaurantInputType)
  data: updateRestaurantInputType;
}

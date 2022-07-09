import { InputType, OmitType } from '@nestjs/graphql';
import { Restaurant } from '../entities/restaurant.entity';

//argument생성
@InputType()
export class createRestaurantDto extends OmitType(
  Restaurant,
  ['id'],
  InputType,
) {}

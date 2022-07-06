import { ArgsType, Field, InputType, OmitType } from '@nestjs/graphql';
import { IsBoolean, IsString, Length } from 'class-validator';
import { Restaurant } from '../entities/restaurant.entity';

//argument생성
@InputType()
export class createRestaurantDto extends OmitType(
  Restaurant,
  ['id'],
  InputType,
) {}

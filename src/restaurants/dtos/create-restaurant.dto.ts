import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Category } from '../entities/category.entity';
import { Restaurant } from '../entities/restaurant.entity';

//argument생성
@InputType()
export class CreateRestaurantInput extends PickType(
  Restaurant,
  ['name', 'coverImg', 'address'],
  InputType,
) {
  @Field((type) => String)
  categoryName: string;
}

@ObjectType()
export class CreateRestaurantOutput extends CoreOutput {}

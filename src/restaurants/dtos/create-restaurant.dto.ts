import { ArgsType, Field } from '@nestjs/graphql';
import { IsBoolean, IsString, Length } from 'class-validator';

//argument생성
@ArgsType()
export class createRestaurantDto {
  @Field((type) => String)
  //class-validator설치해야함
  @IsString()
  @Length(5, 8)
  name: string;

  @Field((type) => Boolean)
  @IsBoolean()
  isVegan: boolean;

  @Field((type) => String)
  @IsString()
  address: string;

  @Field((type) => String)
  @IsString()
  ownerName: string;
}

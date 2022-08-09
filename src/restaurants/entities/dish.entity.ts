import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNumber, IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { Restaurant } from './restaurant.entity';

@InputType('DishChoiceInputType', { isAbstract: true })
@ObjectType()
export class DishChoice {
  @Field((type) => String)
  name: string;

  @Field((type) => Number, { nullable: true })
  extra?: number;
}

@InputType('DishOptionInputType', { isAbstract: true })
@ObjectType()
export class DishOption {
  @Field((type) => String)
  name: string;

  @Field((type) => [DishChoice], { nullable: true })
  choices?: DishChoice[];

  @Field((type) => Number, { nullable: true })
  extra?: number;
}

//entity와 graphql의 스키마 dto를 함께 만들 수 있다
@InputType('DishInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Dish extends CoreEntity {
  @Field((is) => String)
  @Column()
  @IsString()
  @Length(4)
  name: string;

  @Field((is) => Number)
  @Column()
  @IsNumber()
  price: number;

  @Field((is) => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  photo?: string;

  @Field((is) => String)
  @Column()
  @Length(5, 140)
  description: string;

  @Field((type) => Restaurant, { nullable: true })
  @ManyToOne((type) => Restaurant, (restaurant) => restaurant.menu, {
    onDelete: 'CASCADE',
  })
  restaurant: Restaurant;

  //? 레스토랑의 id만 필요한 경우
  @RelationId((dish: Dish) => dish.restaurant)
  restaurantId: number;

  @Field((type) => [DishOption], { nullable: true })
  @Column({ type: 'json', nullable: true })
  options?: DishOption[];
}

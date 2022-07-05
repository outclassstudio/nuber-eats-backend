import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

//entity와 graphql의 스키마를 함께 만들 수 있다
@ObjectType()
@Entity()
export class Restaurant {
  @Field((type) => Number)
  @PrimaryGeneratedColumn()
  id: number;

  @Field((is) => String)
  @Column()
  name: string;

  @Field((is) => Boolean, { nullable: true })
  @Column()
  isVegan?: boolean;

  @Field((is) => String)
  @Column()
  address: string;

  @Field((type) => String)
  @Column()
  ownerName: string;

  @Field((type) => String)
  @Column()
  categoryName: string;
}

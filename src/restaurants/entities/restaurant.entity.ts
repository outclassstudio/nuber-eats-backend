import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Restaurant {
  @Field((is) => String)
  name: string;
  @Field((is) => Boolean, { nullable: true })
  isGood?: boolean;
}

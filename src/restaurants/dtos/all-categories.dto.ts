import { Field, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Category } from '../entities/category.entity';

@ObjectType()
export class AllCategoriesOutput extends CoreOutput {
  //?있을 수도 있고 없을 수도 있을 때는 nullable을 추가하자
  @Field((type) => [Category], { nullable: true })
  categories?: Category[];
}

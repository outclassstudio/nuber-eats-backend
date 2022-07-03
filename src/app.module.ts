import { ApolloDriver } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { RestaurantsModule } from './restaurants/restaurants.module';

@Module({
  //graphQL 모듈 임포트
  imports: [
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      //?자동으로 스키마 파일 생성(true일시 메모리상에 생성, 디렉토리일시 해당 디렉토리에 파일로 생성)
      autoSchemaFile: true,
    }),
    RestaurantsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

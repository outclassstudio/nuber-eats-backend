import { ApolloDriver } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import * as Joi from 'joi';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { Restaurant } from './restaurants/entities/restaurant.entity';

@Module({
  //graphQL 모듈 임포트
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env.test',
      ignoreEnvFile: process.env.NODE_ENV === 'prod',
      validationSchema: Joi.object({
        //배열로 쓰는거 아님
        NODE_ENV: Joi.string().valid('dev', 'prod'),
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      //데이터베이스와 동기화
      synchronize: process.env.NODE_ENV !== 'prod',
      logging: true,
      //참조할 엔티티
      entities: [Restaurant],
    }),
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

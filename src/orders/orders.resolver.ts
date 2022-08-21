import { Inject } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { PUB_SUB } from 'src/common/common.constants';
import { User } from 'src/users/entities/user.entity';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { EditOrderInput, EditOrderOutput } from './dtos/edit-order.dto';
import { GetOrderInput, GetOrderOutput } from './dtos/get-order.dto';
import { GetOrdersInput, GetOrdersOutput } from './dtos/get-orders.dto';
import { OrdersService } from './orders.service';

@Resolver()
export class OrdersResolver {
  constructor(
    private readonly ordersServie: OrdersService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  @Mutation((returns) => CreateOrderOutput)
  @Role(['Client'])
  createOrder(
    @AuthUser() customer: User,
    @Args('input') createOrderInput: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    return this.ordersServie.createOrder(customer, createOrderInput);
  }

  @Mutation((returns) => EditOrderOutput)
  @Role(['Any'])
  editOrder(
    @AuthUser() user: User,
    @Args('input') editOrderInput: EditOrderInput,
  ): Promise<EditOrderOutput> {
    return this.ordersServie.editOrder(user, editOrderInput);
  }

  @Mutation((returns) => Boolean)
  potatoReady(@Args('potatoId') potatoId: number) {
    this.pubSub.publish('hotPotatos', {
      readyPotatos: potatoId,
    });
    return true;
  }

  @Query((returns) => GetOrdersOutput)
  @Role(['Any'])
  getOrders(
    @AuthUser() user: User,
    @Args('input') getOrdersInput: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    return this.ordersServie.getOrders(user, getOrdersInput);
  }

  @Query((returns) => GetOrderOutput)
  @Role(['Any'])
  getOrder(
    @AuthUser() user: User,
    @Args('input') getOrderInput: GetOrderInput,
  ): Promise<GetOrderOutput> {
    return this.ordersServie.getOrder(user, getOrderInput);
  }

  @Subscription((returns) => String, {
    filter: ({ readyPotatos }, { potatoId }, context) => {
      //!return이 true면 실행, false면 실행되지 않음
      return readyPotatos === potatoId;
    },
  })
  @Role(['Any'])
  readyPotatos(@Args('potatoId') potatoId: number) {
    return this.pubSub.asyncIterator('hotPotatos');
  }
}

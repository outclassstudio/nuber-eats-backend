import { InputType, PickType } from '@nestjs/graphql';
import { Order } from '../entities/orders.entity';

@InputType()
export class OrderUpdatesInput extends PickType(Order, ['id']) {}

import { IsObject, IsNotEmpty } from 'class-validator';

export class CreateOrderDto {
  @IsObject()
  @IsNotEmpty()
  shippingAddress: any;
}

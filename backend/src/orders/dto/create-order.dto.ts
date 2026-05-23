import { IsObject, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateOrderDto {
  @IsObject()
  @IsNotEmpty()
  shippingAddress: any;

  @IsOptional()
  pointsToRedeem?: number;
}

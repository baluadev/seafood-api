import { IsString, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ShippingAddressDto {
  @IsString()
  fullName: string;

  @IsString()
  phone: string;

  @IsString()
  address: string;

  @IsString()
  ward: string;

  @IsString()
  district: string;

  @IsString()
  province: string;
}

export class CreateOrderDto {
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;

  @IsOptional()
  @IsString()
  note?: string;
}

export class UpdateOrderStatusDto {
  @IsString()
  status: string;
}

import { IsString, IsNotEmpty, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AddCartItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;
}

export class UpdateCartItemDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;
}

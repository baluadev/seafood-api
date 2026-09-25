import { IsString, IsEnum, IsNumber, IsOptional, IsBoolean, IsDateString, Min } from 'class-validator';
import { CouponType } from '@prisma/client';

export class CreateCouponDto {
  @IsString()
  code: string;

  @IsEnum(CouponType)
  type: CouponType;

  @IsNumber()
  @Min(0)
  value: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderAmt?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscount?: number;

  @IsOptional()
  @IsNumber()
  usageLimit?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  perUserLimit?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateCouponDto {
  @IsOptional()
  @IsEnum(CouponType)
  type?: CouponType;

  @IsOptional()
  @IsNumber()
  value?: number;

  @IsOptional()
  @IsNumber()
  minOrderAmt?: number;

  @IsOptional()
  @IsNumber()
  maxDiscount?: number;

  @IsOptional()
  @IsNumber()
  usageLimit?: number;

  @IsOptional()
  @IsNumber()
  perUserLimit?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  description?: string;
}

export class ValidateCouponDto {
  @IsString()
  code: string;

  @IsNumber()
  @Min(0)
  orderAmount: number;
}

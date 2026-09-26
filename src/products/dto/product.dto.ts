import {
  IsString, IsOptional, IsBoolean, IsInt,
  IsNumber, Min, Max, IsUUID, IsArray, IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsUUID()
  categoryId: string;

  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  discountRate?: number;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stockQuantity?: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsBoolean()
  isHot?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  // ─── Tab 0: Thông tin sản phẩm & Dinh dưỡng ───
  @IsOptional()
  @IsString()
  origin?: string;

  @IsOptional()
  @IsString()
  packagingInfo?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  preservationDays?: number;

  @IsOptional()
  @IsString()
  cultivationMethod?: string;

  @IsOptional()
  nutritionInfo?: Record<string, string>; // { calories, protein, fat, carbs, fiber }

  // ─── Tab 1: Nguồn gốc & Chứng nhận ───
  @IsOptional()
  @IsString()
  farmName?: string;

  @IsOptional()
  @IsString()
  farmAddress?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certifications?: string[];

  @IsOptional()
  @IsString()
  farmImageUrl?: string;

  // ─── Tab 2: Gợi ý món ngon & Bảo quản ───
  @IsOptional()
  @IsString()
  storageGuide?: string;

  @IsOptional()
  recipes?: { icon: string; title: string; content: string }[];
}

export class UpdateProductDto {
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  discountRate?: number;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stockQuantity?: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsBoolean()
  isHot?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  // ─── Tab 0: Thông tin sản phẩm & Dinh dưỡng ───
  @IsOptional()
  @IsString()
  origin?: string;

  @IsOptional()
  @IsString()
  packagingInfo?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  preservationDays?: number;

  @IsOptional()
  @IsString()
  cultivationMethod?: string;

  @IsOptional()
  nutritionInfo?: Record<string, string>;

  // ─── Tab 1: Nguồn gốc & Chứng nhận ───
  @IsOptional()
  @IsString()
  farmName?: string;

  @IsOptional()
  @IsString()
  farmAddress?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certifications?: string[];

  @IsOptional()
  @IsString()
  farmImageUrl?: string;

  // ─── Tab 2: Gợi ý món ngon & Bảo quản ───
  @IsOptional()
  @IsString()
  storageGuide?: string;

  @IsOptional()
  recipes?: { icon: string; title: string; content: string }[];
}

export class ProductQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 12;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'rating';

  @IsOptional()
  isHot?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @IsOptional()
  @IsString()
  all?: string; // 'true' = lấy tất cả không phân trang (dùng cho admin)
}

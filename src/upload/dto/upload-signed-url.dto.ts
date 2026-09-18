import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UploadSignedUrlDto {
  @IsString()
  filename: string;

  @IsString()
  contentType: string;

  @IsOptional()
  @IsString()
  folder?: string;
}

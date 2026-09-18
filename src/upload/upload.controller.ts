import { Body, Controller, Post } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadSignedUrlDto } from './dto/upload-signed-url.dto';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('upload')
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post('signed-url')
  @Roles('ADMIN')
  getSignedUrl(@Body() dto: UploadSignedUrlDto) {
    return this.uploadService.getSignedUploadUrl(dto.filename, dto.contentType, dto.folder);
  }
}

import { Injectable, BadRequestException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private _client: SupabaseClient | null = null;
  private readonly BUCKET = process.env.SUPABASE_BUCKET || 'image-uploads';
  private readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  private get supabase(): SupabaseClient {
    if (!this._client) {
      const url = process.env.SUPABASE_URL;
      const key = process.env.SUPABASE_SERVICE_KEY;
      if (!url || !key) {
        throw new BadRequestException(
          'Supabase chưa được cấu hình. Vui lòng thêm SUPABASE_URL và SUPABASE_SERVICE_KEY vào .env',
        );
      }
      this._client = createClient(url, key);
    }
    return this._client;
  }

  async getSignedUploadUrl(filename: string, contentType: string, folder = 'products') {
    if (!this.ALLOWED_TYPES.includes(contentType)) {
      throw new BadRequestException(`Chỉ hỗ trợ: ${this.ALLOWED_TYPES.join(', ')}`);
    }

    const ext = filename.split('.').pop()?.toLowerCase() || 'jpg';
    const key = `${folder}/${uuidv4()}.${ext}`;

    const { data, error } = await this.supabase.storage
      .from(this.BUCKET)
      .createSignedUploadUrl(key);

    if (error) throw new BadRequestException(`Upload lỗi: ${error.message}`);

    const publicUrl = this.supabase.storage.from(this.BUCKET).getPublicUrl(key).data.publicUrl;

    return { uploadUrl: data.signedUrl, token: data.token, path: key, publicUrl };
  }
}

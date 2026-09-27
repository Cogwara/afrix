import { createAdminClient } from "../supabase/admin";

export const ALLOWED_EVIDENCE_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "audio/mp4",
  "video/mp4",
  "video/webm",
  "application/pdf",
  "text/plain",
  "text/csv",
];

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export class StorageService {
  /**
   * Upload file to Supabase Storage with strict MIME and size validation
   */
  static async uploadFile({
    bucket,
    path,
    buffer,
    mimeType,
  }: {
    bucket: "avatars" | "task-evidence" | "business-assets";
    path: string;
    buffer: Buffer;
    mimeType: string;
  }) {
    if (buffer.length > MAX_FILE_SIZE_BYTES) {
      throw new Error(`File exceeds maximum size of 10MB (${(buffer.length / 1024 / 1024).toFixed(1)}MB)`);
    }

    if (!ALLOWED_EVIDENCE_MIMES.includes(mimeType)) {
      throw new Error(`Invalid file type: ${mimeType}. Executables and unsupported formats are blocked.`);
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase.storage.from(bucket).upload(path, buffer, {
      contentType: mimeType,
      upsert: true,
    });

    if (error) {
      throw new Error(`Storage upload failed: ${error.message}`);
    }

    return data;
  }

  /**
   * Get a signed URL for private task evidence (expires in 1 hour by default)
   */
  static async getSignedUrl(bucket: string, path: string, expiresInSeconds: number = 3600): Promise<string> {
    const supabase = createAdminClient();
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresInSeconds);

    if (error || !data?.signedUrl) {
      // Return placeholder or fallback URL if offline/mock
      return `/api/storage/placeholder?bucket=${bucket}&path=${encodeURIComponent(path)}`;
    }

    return data.signedUrl;
  }

  /**
   * Get public URL for avatars and business logos
   */
  static getPublicUrl(bucket: string, path: string): string {
    const supabase = createAdminClient();
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }
}

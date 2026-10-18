/** Accepted upload formats and the extension used in the served URL. */
export const UPLOAD_FORMATS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
  "application/pdf": "pdf",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

/** ~6 MB for images, ~35 MB for video/PDF (base64 is ~33% larger than raw). */
export const MAX_IMAGE_BASE64 = 8_000_000;
export const MAX_FILE_BASE64 = 48_000_000;

export const BASE64_CHUNK = /^[A-Za-z0-9+/=]+$/;
